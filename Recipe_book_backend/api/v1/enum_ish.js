const Role = {
    user: 'USER',
    admin: 'ADMIN',
    super_admin: 'SUPER ADMIN',
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
  not_read: "not read" // used to get not read notifications
}

const Which = {
    following: 'following',
    followers: 'followers',
};

const Is_Verified = {
    verified: 'VERIFIED',
    not_verified: 'NOT VERIFIED',
};

const Collections = {
  user: 'User',
  recipe: 'Recipe',
  review: 'Review',
  notification: 'Notification',
};

const Power = {
  on: 'ON',
  off: 'OFF',
}

const RedisFormatCombo = {
  User: {
    single: ['User', 'single'],
    list: ['User', 'list', 'list'],
    count: ['User', 'list', 'count'],
  },
  Recipe: {
    single: ['Recipe', 'single'],
    list: ['Recipe', 'list', 'list'],
    count: ['Recipe', 'list', 'count'],
  },
  Review: {
    single: ['Review', 'single'],
    list: ['Review', 'list', 'list'],
    count: ['Review', 'list', 'count'],
  },
  Notification: {
    single: ['Notification', 'single'],
    list: ['Notification', 'list', 'list'],
    count: ['Notification', 'list', 'count'],
  },
}

module.exports = { Role, Type, Permit, Status, Which, Is_Verified, Collections, Power, RedisFormatCombo };
