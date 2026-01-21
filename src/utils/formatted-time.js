const formattedTime = (time) => {
    if(!time) return
    
    const now = new Date();
    const postDate = new Date(time);
    const diffMs = now - postDate;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return 'agora';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    if (diffDays < 365) return postDate.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'short',
    });
    return postDate.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'short',
    });
}

export default formattedTime