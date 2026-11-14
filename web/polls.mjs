export function createPoll(question, labels) {
  const cleanLabels = [...new Set(labels.map(label => String(label).trim()).filter(Boolean))];
  if (!String(question || '').trim() || cleanLabels.length < 2 || cleanLabels.length > 12) return null;
  return {
    id: crypto.randomUUID(),
    question: String(question).trim().slice(0, 120),
    options: cleanLabels.map(label => ({ id: crypto.randomUUID(), label: label.slice(0, 80) })),
    votes: {},
  };
}

export function publicPoll(poll, token) {
  const counts = Object.values(poll.votes || {});
  return {
    id: poll.id,
    question: poll.question,
    options: poll.options.map(option => ({ ...option, count: counts.filter(id => id === option.id).length })),
    total: counts.length,
    myVote: poll.votes?.[token] || null,
  };
}
