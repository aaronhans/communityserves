<script>
    import { Tabs, TabList, TabPanel, Tab } from './tabs.js';
    import RequestCard from './RequestCard.svelte'
    import RequestDetails from './RequestDetails.svelte'
    import utils from '../scripts/utils.js'
    // import * as cleanupRequests from '../data/clean-up-requests.json'
    // import { features } from 'data/art-requests.json';
    import artReqestJSON from '../public/data/art-requests.json'
    import completedArtInstallsJSON from '../public/data/entered-data.json'
    let artRequests = utils.formatRequests(artReqestJSON.features);   
    let completedArtRequests = utils.formatRequests(completedArtInstallsJSON.features); 
    let selectedRequestID = null;

    $: selectedRequest = artRequests[selectedRequestID] || completedArtRequests[selectedRequestID];
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
                
            </div>
        </TabPanel>

        <TabPanel>
            <p>Tap serve if you are an artist interested in claiming this spot.</p>
            <div class="art-requests">
                {#each Object.keys(artRequests) as requestID}
                    <RequestCard request="{artRequests[requestID]}" bind:selectedRequest={selectedRequestID}/>
                {/each} 
                {#each Object.keys(completedArtRequests) as requestID}
                    <RequestCard request="{completedArtRequests[requestID]}" bind:selectedRequest={selectedRequestID}/>
                {/each}
            </div>
        </TabPanel>
    </Tabs>
</section>

{#if selectedRequest}
    <RequestDetails bind:request={selectedRequest} />
{/if}