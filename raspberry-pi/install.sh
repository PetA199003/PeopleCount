#!/bin/bash
# Installation script for Raspberry Pi Camera Node

echo "🔧 Installing OpenCV Person Counter Camera Node..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python dependencies
sudo apt install -y python3-pip python3-opencv python3-numpy

# Install additional OpenCV dependencies
sudo apt install -y libopencv-dev python3-opencv

# Install camera support
sudo apt install -y python3-picamera2

# Create systemd service
sudo tee /etc/systemd/system/person-counter-camera.service > /dev/null <<EOF
[Unit]
Description=Person Counter Camera Node
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/person-counter
ExecStart=/usr/bin/python3 /home/pi/person-counter/camera-node.py --camera-id=\${CAMERA_ID} --server-host=\${SERVER_HOST}
Restart=always
RestartSec=10
Environment=CAMERA_ID=cam1
Environment=SERVER_HOST=192.168.1.100

[Install]
WantedBy=multi-user.target
EOF

# Enable camera interface
sudo raspi-config nonint do_camera 0

# Create configuration directory
mkdir -p /home/pi/person-counter
cp camera-node.py /home/pi/person-counter/

# Set permissions
sudo chown -R pi:pi /home/pi/person-counter
chmod +x /home/pi/person-counter/camera-node.py

echo "✅ Installation complete!"
echo "📝 Edit /etc/systemd/system/person-counter-camera.service to configure camera ID and server IP"
echo "🚀 Start service with: sudo systemctl enable person-counter-camera && sudo systemctl start person-counter-camera"