export default [
    {
        path: '/',
        name: 'Login',
        meta: {
            routeAuth: true,
            rootPage: 'auth',
            title: '1Kole - Login'
        },
        component: () => import('./views/Auth.vue')
    }
]