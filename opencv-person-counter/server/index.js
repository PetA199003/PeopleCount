import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import PersonCounterService from './person-counter-service.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const personCounter = new PersonCounterService();

app.use(cors());
app.use(express.json());

// Start the person counter service
personCounter.start();

// WebSocket for real-time updates
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Send initial data
  const stats = personCounter.getCurrentStats();
  ws.send(JSON.stringify({
    type: 'count_update',
    data: { total: stats.total, todayIn: stats.todayIn, todayOut: stats.todayOut }
  }));
  
  ws.send(JSON.stringify({
    type: 'camera_update',
    data: stats.cameras
  }));

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Broadcast to all connected clients
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify(data));
    }
  });
}

// Person counter event handlers
personCounter.on('count_update', (data) => {
  broadcast({ type: 'count_update', data });
});

personCounter.on('camera_update', (cameras) => {
  broadcast({ type: 'camera_update', data: cameras });
});

personCounter.on('alarm_created', (alarm) => {
  broadcast({ type: 'alarm', data: alarm });
});

// API Routes

// Get current count
app.get('/api/count', (req, res) => {
  const stats = personCounter.getCurrentStats();
  res.json({
    total: stats.total,
    todayIn: stats.todayIn,
    todayOut: stats.todayOut,
    timestamp: new Date().toISOString()
  });
});

// Reset counter
app.post('/api/reset', (req, res) => {
  personCounter.resetCounter();
  
  res.json({ success: true, message: 'Counter reset successfully' });
});

// Trigger announcement
app.post('/api/announcement', (req, res) => {
  const { message, volume = 80 } = req.body;
  
  console.log(`📢 Durchsage: "${message}" (Lautstärke: ${volume}%)`);
  
  // Simulate announcement trigger
  broadcast({
    type: 'announcement',
    data: { message, volume, timestamp: new Date().toISOString() }
  });
  
  res.json({ 
    success: true, 
    message: 'Announcement triggered',
    data: { message, volume }
  });
});

// Control LED display via Companion
app.post('/api/led-display', (req, res) => {
  const { action, content, companionIP = '192.168.1.100' } = req.body;
  
  console.log(`🖥️ LED Display: ${action} - ${content} (Companion: ${companionIP})`);
  
  // Simulate Companion communication
  const companionCommand = {
    page: 'led-wall',
    action: action,
    content: content,
    timestamp: new Date().toISOString()
  };
  
  broadcast({
    type: 'led_display',
    data: companionCommand
  });
  
  res.json({ 
    success: true, 
    message: 'LED display command sent',
    companionCommand
  });
});

// Get camera feeds (simulation)
app.get('/api/cameras', (req, res) => {
  const cameras = personCounter.getCameraData();
  res.json(cameras);
});

// Update camera configuration
app.put('/api/cameras/:id', (req, res) => {
  const { id } = req.params;
  const config = req.body;
  
  personCounter.updateCameraConfig(id, config);
  
  res.json({ success: true, message: 'Camera configuration updated' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 PersonCounter API running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`📹 TCP Camera server ready on port 8888`);
  console.log(`🔗 API available at http://localhost:${PORT}/api`);
});