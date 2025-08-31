#!/usr/bin/env python3
"""
OpenCV Camera Node for Raspberry Pi
Captures video, processes person detection, and sends results to central server
"""

import cv2
import numpy as np
import json
import socket
import threading
import time
import argparse
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class PersonDetector:
    def __init__(self, min_person_size=50, max_person_size=200, sensitivity=0.7):
        # Initialize HOG descriptor for person detection
        self.hog = cv2.HOGDescriptor()
        self.hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
        
        self.min_person_size = min_person_size
        self.max_person_size = max_person_size
        self.sensitivity = sensitivity
        
        # Background subtractor for motion detection
        self.bg_subtractor = cv2.createBackgroundSubtractorMOG2(detectShadows=True)
        
    def detect_persons(self, frame, zones):
        """Detect persons in frame and determine their zone"""
        detections = []
        
        # Resize frame for faster processing
        height, width = frame.shape[:2]
        scale = 0.5
        small_frame = cv2.resize(frame, (int(width * scale), int(height * scale)))
        
        # Detect persons using HOG
        persons, weights = self.hog.detectMultiScale(
            small_frame,
            winStride=(8, 8),
            padding=(32, 32),
            scale=1.05,
            hitThreshold=self.sensitivity
        )
        
        # Scale back to original size
        persons = [(int(x/scale), int(y/scale), int(w/scale), int(h/scale)) 
                  for (x, y, w, h) in persons]
        
        # Filter by size and check zones
        for (x, y, w, h) in persons:
            if self.min_person_size <= w <= self.max_person_size:
                center_x = x + w // 2
                center_y = y + h // 2
                
                # Check which zone the person is in
                zone = self.get_zone(center_x, center_y, zones)
                if zone:
                    detections.append({
                        'x': x,
                        'y': y,
                        'width': w,
                        'height': h,
                        'center_x': center_x,
                        'center_y': center_y,
                        'zone': zone,
                        'confidence': float(weights[len(detections)] if len(detections) < len(weights) else 0.8),
                        'timestamp': datetime.now().isoformat()
                    })
        
        return detections
    
    def get_zone(self, x, y, zones):
        """Determine which zone a point belongs to"""
        for zone_name, zone_config in zones.items():
            if not zone_config.get('enabled', False):
                continue
                
            if (zone_config['x'] <= x <= zone_config['x'] + zone_config['width'] and
                zone_config['y'] <= y <= zone_config['y'] + zone_config['height']):
                return zone_name
        return None

class CameraNode:
    def __init__(self, camera_id, server_host, server_port, camera_index=0):
        self.camera_id = camera_id
        self.server_host = server_host
        self.server_port = server_port
        self.camera_index = camera_index
        
        self.detector = PersonDetector()
        self.cap = None
        self.socket = None
        self.running = False
        
        # Default zones (will be updated from server)
        self.zones = {
            'entry': {'enabled': True, 'x': 100, 'y': 200, 'width': 300, 'height': 100},
            'exit': {'enabled': True, 'x': 500, 'y': 200, 'width': 300, 'height': 100}
        }
        
    def initialize_camera(self):
        """Initialize Raspberry Pi camera"""
        logger.info(f"Initializing camera {self.camera_index}...")
        
        # For Raspberry Pi High Quality Camera
        self.cap = cv2.VideoCapture(self.camera_index)
        
        if not self.cap.isOpened():
            logger.error(f"Failed to open camera {self.camera_index}")
            return False
            
        # Set camera properties for High Quality Camera
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)
        self.cap.set(cv2.CAP_PROP_FPS, 30)
        
        logger.info("Camera initialized successfully")
        return True
    
    def connect_to_server(self):
        """Establish TCP connection to central server"""
        try:
            self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.socket.connect((self.server_host, self.server_port))
            
            # Send camera registration
            registration = {
                'type': 'camera_registration',
                'camera_id': self.camera_id,
                'timestamp': datetime.now().isoformat()
            }
            self.send_data(registration)
            
            logger.info(f"Connected to server {self.server_host}:{self.server_port}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to server: {e}")
            return False
    
    def send_data(self, data):
        """Send JSON data to server"""
        if self.socket:
            try:
                message = json.dumps(data) + '\n'
                self.socket.send(message.encode('utf-8'))
            except Exception as e:
                logger.error(f"Failed to send data: {e}")
                self.reconnect()
    
    def reconnect(self):
        """Reconnect to server"""
        logger.info("Attempting to reconnect...")
        if self.socket:
            self.socket.close()
        time.sleep(5)
        self.connect_to_server()
    
    def process_frame(self, frame):
        """Process frame and detect persons"""
        detections = self.detector.detect_persons(frame, self.zones)
        
        if detections:
            # Send detection data to server
            detection_data = {
                'type': 'person_detection',
                'camera_id': self.camera_id,
                'detections': detections,
                'timestamp': datetime.now().isoformat()
            }
            self.send_data(detection_data)
            
            # Draw detection boxes for debugging (optional)
            for detection in detections:
                x, y, w, h = detection['x'], detection['y'], detection['width'], detection['height']
                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                cv2.putText(frame, f"{detection['zone']}", (x, y-10), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        return frame, detections
    
    def run(self):
        """Main camera processing loop"""
        if not self.initialize_camera():
            return
            
        if not self.connect_to_server():
            return
            
        self.running = True
        logger.info(f"Camera node {self.camera_id} started")
        
        try:
            while self.running:
                ret, frame = self.cap.read()
                if not ret:
                    logger.warning("Failed to read frame")
                    continue
                
                # Process frame
                processed_frame, detections = self.process_frame(frame)
                
                # Send heartbeat every 30 seconds
                if int(time.time()) % 30 == 0:
                    heartbeat = {
                        'type': 'heartbeat',
                        'camera_id': self.camera_id,
                        'status': 'online',
                        'timestamp': datetime.now().isoformat()
                    }
                    self.send_data(heartbeat)
                
                # Small delay to prevent overwhelming the CPU
                time.sleep(0.1)
                
        except KeyboardInterrupt:
            logger.info("Shutting down camera node...")
        except Exception as e:
            logger.error(f"Error in main loop: {e}")
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Clean up resources"""
        self.running = False
        if self.cap:
            self.cap.release()
        if self.socket:
            self.socket.close()
        logger.info("Camera node stopped")

def main():
    parser = argparse.ArgumentParser(description='OpenCV Camera Node for Person Counting')
    parser.add_argument('--camera-id', required=True, help='Unique camera identifier')
    parser.add_argument('--server-host', default='192.168.1.100', help='Central server IP')
    parser.add_argument('--server-port', type=int, default=8888, help='Central server port')
    parser.add_argument('--camera-index', type=int, default=0, help='Camera device index')
    
    args = parser.parse_args()
    
    camera_node = CameraNode(
        camera_id=args.camera_id,
        server_host=args.server_host,
        server_port=args.server_port,
        camera_index=args.camera_index
    )
    
    camera_node.run()

if __name__ == "__main__":
    main()