<script>
    export let request;
    let createDate = new Date(request.properties.createDate);
    let formattedDate = createDate ? `${createDate.getMonth()}/${createDate.getDay()} &middot; ${createDate.getHours()}:${createDate.getMinutes()}`: '';
</script>
<div class="request-card">
    {#if request.properties.imgURL}
        <div class="request-img"><img src="{request.properties.imgID}" alt="Request Location"></div>
    {/if}
    <div class="request-details">
        {#if request.properties.businessName}
            <div class="request-name">{request.properties.businessName}</div>
        {/if}
        <div class="create-date">{@html formattedDate}</div>
        <a class="more-details">See Details</a>
    </div>
    <div class="request-cta">
        <button class="serve-cta primary-btn">
        Serve<br>
        <!-- <span class="sub"><span class="volunteer-count">None</span> have joined</span> -->
        </button>
    </div>
</div>

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