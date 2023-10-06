const Role = {
    user: 'USER',
    admin: 'ADMIN',
};
const Type = { 
    soup: 'SOUP',
    pastry: 'PATRY',
    pasta: 'PASTA',
    pizza: 'PIZZA',
    snacks: 'SNACKS',
    rice: 'RICE',
    food: 'FOOD',
};
const Permit = {
    private: 'PRIVATE',
    public: 'PUBLIC',
};

const Status = {
    sent: 'SENT',
    received: 'RECEIVED',
    read: 'READ',
}

const Which = {
    following: 'following',
    followers: 'followers',
}

module.exports = { Role, Type, Permit, Status, Which };
