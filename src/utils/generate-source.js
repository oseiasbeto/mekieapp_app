
const generateSource = (conv, userId) => {
    if (!conv) return 'active'
    const isArchived = conv?.archived_by?.includes(userId)

    if (isArchived) return 'archived'
    else return 'active'
}

export default generateSource