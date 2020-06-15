var ghpages = require('gh-pages');

ghpages.publish(
    'communityserves',// <-- replace yourproject with your repo name
    {
        branch: 'gh-pages',
        repo: 'https://github.com/aaronhans/communityserves',
        user: {
            name: 'Aaron Hans',
            email: 'aaron.hans@alpha.ca.gov'
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)