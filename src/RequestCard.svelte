<script>
    import utils from '../scripts/utils.js'

    export let request;
    export let selectedRequest;
    let formattedDate;
    if(request){
      formattedDate = utils.formatDate(new Date(request.properties.createDate))
    }
    function selectRequest() {
      selectedRequest = request.id.replace(/ /g, "");
    }
</script>

{#if request}
<div class="request-card" on:click={selectRequest}>
    {#if false && request.properties.imgURL}
        <div class="request-img"><img src="{request.properties.imgURL.split('id=') ? `https://drive.google.com/file/d/${request.properties.imgURL.split('id=')[1]}/preview` : request.properties.imgURL}" alt="Request Location"></div>
    {/if}
    <div class="request-details">
        {#if request.properties.businessName}
            <div class="request-name">{request.properties.businessName}</div>
        {/if}
        {#if formattedDate}<div class="create-date">{@html formattedDate}</div>{/if}
        <a name="more-details" on:click={selectRequest}>Tap to see more</a>
    </div>
    <div class="request-cta">
        <button class="serve-cta primary-btn" on:click={selectRequest}>
          Serve<br>
        <!-- <span class="sub"><span class="volunteer-count">None</span> have joined</span> -->
        </button>
    </div>
</div>
{/if}

<style>
.request-card {
  margin-bottom: 1em;
  border: 1px solid #6209F2;
  border-radius: 2px;
  display: flex;
}

.request-img{
  background: grey;
  width: 50px;
}

.request-details{
  padding: 0.5em;
  flex: 1;
}

.request-cta{
  padding: 0.5em;
  align-self: center;
}

.request-cta .serve-cta {
  font-size: 1em;
  line-height: 0.75em;
}

.request-cta .serve-cta .sub {
  font-size: 0.5em;
}
</style>