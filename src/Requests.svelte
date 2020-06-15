<script>
    import { Tabs, TabList, TabPanel, Tab } from './tabs.js';
    import RequestCard from './requestCard.svelte'
    // import * as cleanupRequests from '../data/clean-up-requests.json'
    // import { features } from 'data/art-requests.json';
    import { features } from '../public/data/art-requests.json'

    console.log(features);
</script>

<section>
    <h1 class="header">&darr; Recent Posts</h1>
    <Tabs>
        <TabList>
            <Tab class="cleanup">Clean Ups</Tab>
            <Tab class="art">Art Requests</Tab>
        </TabList>

        <TabPanel>
            <p>Tap serve if you’d like to get involved with a clean up request, then share with your neighbors.</p>
            <div class="cleanup-requests">
                <!-- {#each cats as { id, name }, i}
                    <RequestCard />
                {/each}  -->
            </div>
        </TabPanel>

        <TabPanel>
            <p>Tap serve if you are an artist interested in claiming this spot.</p>
            <div class="cleanup-requests"></div>
        </TabPanel>
    </Tabs>
</section>
