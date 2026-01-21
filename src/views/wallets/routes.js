export default [
    {
        path: '/rewards',
        name: 'Rewards',
        meta: {
             requiresAuth: true,
            rootPage: 'wallets',
            title: 'Recompensas'
        },
        component: () => import('./views/Rewards.vue')
    }
]