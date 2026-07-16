# UDP Parser app for CHESTER Motion

A UDP parser server that receives messages from HARDWARIO CHESTER Motion IoT devices over NB-IoT, decodes them from binary CBOR format, and forwards them via a secured webhook to a cloud application for storage and real-time distribution.

## Architecture

The system consists of three components:

- **UDP Server** — receives UDP packets from IoT devices, validates packet integrity using HMAC-SHA256, decodes CBOR payloads, and forwards data to the backend via webhook
- **Backend** — Express.js REST API that stores messages in MongoDB and distributes real-time updates via Socket.io
- **Frontend** — React application for managing locations, rooms, devices, and viewing incoming sensor data

## Requirements

- Docker and Docker Compose
- OpenVPN client (required for Vodafone IoT Easy Connect SIM routing)
- Node.js 22+ and a local MongoDB instance (for local development only)

## Environment Variables

Create a `.env` file in the project root:

```env
JWT_SECRET=your_jwt_secret
WEBHOOK_SECRET=your_webhook_secret
REACT_APP_API_URL=http://your-server-ip:3000
REACT_APP_SERVER_URL=http://your-server-ip:3000
CORS_ORIGIN=http://your-server-ip
```

> `REACT_APP_API_URL` must **not** include an `/api` suffix — the frontend appends
> `/api` itself, so `http://your-server-ip:3000` (not `.../3000/api`) is correct.

## Running with Docker

```bash
docker compose up -d --build
```

Services:
| Service | Port |
|---|---|
| Frontend (nginx) | 80 |
| Backend (Express.js) | 3000 |
| UDP Server | 5003 |
| MongoDB | 27017 |

## NB-IoT Network Setup

CHESTER Motion devices communicate over NB-IoT via Vodafone IoT Easy Connect SIM cards. The Vodafone network uses CGNAT, which prevents direct UDP routing to arbitrary public IP addresses. An OpenVPN tunnel into the Vodafone network is required.

**Install and start OpenVPN:**
```bash
apt-get install openvpn -y
openvpn --config ~/client.ovpn --daemon
```

The VPN assigns your server an IP address reachable from within the Vodafone network (e.g. `100.127.x.x`). Configure the device to send UDP packets to this VPN IP on port 5003.

**CHESTER device configuration (via Bluetooth Terminal):**
```
lte config mode "lte-m,nb-iot"
lte config apn ""
lte config auth "none"
lte config addr "100.127.x.x"
config save
```

## Device Registration

Each CHESTER device has a unique claim token used for packet authentication. Before a device can communicate with the server, it must be registered in the application with its serial number and claim token.

The claim token can be found by scanning the QR code on the back of the device, which encodes a URL in the format:
```
https://device.hardwario.com/{serialNumber}/{claimToken}/{bleDevAddr}
```

Register the device through the frontend UI by entering the serial number and claim token manually.

## Protocol

The server implements the HARDWARIO Cloud v2 UDP protocol. Each UDP packet is:

1. Base64 encoded
2. Prefixed with an 8-byte SHA-256 hash (XOR-folded, keyed with the device's claim token)
3. Followed by a 4-byte serial number and 2-byte header (flags + sequence number)
4. Followed by a CBOR-encoded payload

The server handles the full session handshake (`UL_CREATE_SESSION` → `ACK+POLL` → `POLL` → `DL_SET_SESSION`) before data packets are accepted.

## Project Structure

```
├── udp-server/          # UDP parser server (Node.js)
│   ├── server.js
│   └── services/
│       ├── protocol/    # Cloud v2 protocol (packet, session, downlink, router)
│       ├── decoder/     # CBOR decoding and key mapping
│       ├── db.js        # MongoDB connection
│       └── webhook.js   # Webhook forwarding
├── server/              # Backend REST API (Express.js)
│   ├── abl/             # Application business logic
│   ├── dao/             # Data access objects
│   ├── middleware/      # Auth, authorization
│   ├── models/          # Mongoose schemas
│   └── routes/          # API routes
└── client/              # Frontend (React)
    └── src/
        ├── pages/       # Locations, Rooms, Devices, Messages
        ├── components/  # Shared UI components
        └── api/         # Axios and Socket.io setup
```

## Local Development

Requires a MongoDB instance running locally (e.g. `docker run -d -p 27017:27017 mongo:7`)
before starting the backend or UDP server.

**Backend:**
```bash
cd server
npm install
npm run dev
```

**UDP Server:**
```bash
cd udp-server
npm install
npm start
```

**Frontend:**
```bash
cd client
npm install
npm start
```

## Notes

- CBOR payloads from CHESTER Motion use numeric integer keys, not string keys as shown in HARDWARIO documentation. The documentation describes the JSON output after translation by HARDWARIO Cloud. The UDP server handles the key mapping internally.
- The downlink mechanism (server → device) works only during the brief communication window after the device sends an uplink. The server queues pending downlinks and delivers them on the next connection.
- Direct downlink without the HARDWARIO Cloud infrastructure is supported starting from firmware v3.5.5.