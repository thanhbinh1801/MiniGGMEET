export default function generateMeetingId() {
  return Math.random().toString(36).substring(2, 11).match(/.{3}/g).join('-');
}
