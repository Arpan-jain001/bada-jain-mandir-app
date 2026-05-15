function receiptNumber() {
  const date = new Date();
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `BJMP-${stamp}-${suffix}`;
}

module.exports = receiptNumber;
