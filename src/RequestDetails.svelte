<script>
    export let request;
    console.log(request);
</script>

{#if request}
<section>
    <div class="request-imgs"></div>
    <div class="request-details">
        <div class="request-header">
        <a click="back" href>Recent Requests</a>
        <button class="serve-cta primary-btn">
            Serve<br>
            <span class="sub"><span class="volunteer-count">None</span> have joined</span>
        </button>
        </div>

        <h2>Clean Up Request</h2>
        <div class="business-details">
            <div class="business-location"></div>
            <div class="business">
                <div class="business-name"></div>
                <div class="business-address"></div>
            </div>
        </div>
    </div>
</section>
{/if}