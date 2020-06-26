<script>
    import utils from '../scripts/utils.js'

    export let request;
    export let selectedRequest;
    let { imgURL, business, category} = request.properties;
    let formattedDate;
    if(request){
      formattedDate = utils.formatDate(request.properties.createDate);
    }
    function selectRequest() {
      selectedRequest = request.id.replace(/ /g, "");
    }
</script>

{#if request}
<div class="request-card" on:click={selectRequest}>
    {#if imgURL && imgURL.indexOf('google')===-1}
      <div class="request-img" style="background-image: url({imgURL})" alt="Request Location"></div>
    {/if}
    <div class="request-details">
        {#if business}
            <div class="request-name">{business}</div>
        {/if}
        {#if formattedDate}<div class="create-date">{@html formattedDate}</div>
        {:else}<div class="create-date">June 2020</div>{/if}
        <a name="more-details" on:click={selectRequest}>Tap to see more</a>
    </div>
    {#if category !== 'Art Install'}
    <div class="request-cta">
        <button class="serve-cta primary-btn" on:click={selectRequest}>
          Serve<br>
        <!-- <span class="sub"><span class="volunteer-count">None</span> have joined</span> -->
        </button>
    </div>
    {/if}
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
  background-size: cover;
  background-position: center;
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