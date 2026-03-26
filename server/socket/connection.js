// userId -> Set of socketIds (one user can have multiple tabs/connections)
export const userSockets = new Map();

export function handleConnection(socket) {
  const userId = String(socket.user.id);
  console.log(`Socket connected: ${socket.id} (user: ${userId})`);

  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  userSockets.get(userId).add(socket.id);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id} (user: ${userId})`);
    userSockets.get(userId)?.delete(socket.id);
    if (userSockets.get(userId)?.size === 0) {
      userSockets.delete(userId);
    }
  });
}
