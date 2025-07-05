import IRoute from '@interfaces/IRoute'
import Counter from '../views/counter'
import Landing from '../views/company/Landing'
import Login from '../views/company/Login'
import CreateBounty from '../views/company/CreateBounty'
import LeadResults from '../views/company/LeadResults'
import Register from '../views/agent/Register'
import Dashboard from '../views/agent/Dashboard'

const routes: IRoute[] = [
    {
        path: '/',
        name: 'Landing Page',
        component: Landing,
        exact: true,
    },
    // Company routes
    {
        path: '/company/login',
        name: 'Company Login',
        component: Login,
        exact: true,
    },
    {
        path: '/company/create-bounty',
        name: 'Create Bounty',
        component: CreateBounty,
        exact: true,
    },
    {
        path: '/company/lead-results',
        name: 'Lead Results',
        component: LeadResults,
        exact: true,
    },
    // Agent routes
    {
        path: '/agent/register',
        name: 'Agent Registration',
        component: Register,
        exact: true,
    },
    {
        path: '/agent/dashboard',
        name: 'Agent Dashboard',
        component: Dashboard,
        exact: true,
    },
    // Keep the counter route for testing
    {
        path: '/counter',
        name: 'Counter Page',
        component: Counter,
        exact: true,
    },
]

export default routes
