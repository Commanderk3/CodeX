function generateRoomCode(): string {
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timePart = Date.now().toString(36).substring(4, 8).toUpperCase();
  return random + timePart;
}

export { generateRoomCode };