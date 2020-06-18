<script>
    import utils from '../scripts/utils.js'
    export let request;
    $: console.log(request);

    function unselectRequest() {
        request = null;
    }
</script>

{#if request}
<div class="request-details">
    <div class="imgs"></div>
    <div class="details">
        <div class="header">
            <a on:click={unselectRequest} name="back">&larr; Recent Requests</a>
            <a class="serve-cta primary-btn" href="https://forms.gle/8PXQH6BJRzT5FAGy8">
                Serve<br>
                <!-- <span class="sub"><span class="volunteer-count">None</span> have joined</span> -->
            </a>
        </div>

        <h2>{request.properties.category}</h2>
        <div class="business-details">
            <div class="business-location"></div>
            <div class="business">
                <div class="business-name"></div>
                <a class="business-address" href="https://www.google.com/maps/place/{request.properties.address.replace(/ /g, '+')}" target="_blank">{request.properties.address}</a>
            </div>
        </div>
        <div class="contact">
            <div>Contact: {request.properties.contact.phone}</div>
            <div>{@html utils.formatDate(new Date(request.properties.createDate)) }</div>
        </div><br>
        <div class="instructions">
            <strong>How to serve in 6 steps</strong>
            <div>Call the business to arrange logistics [1</div>
            <div>Fill out This Form once you’re ready [2</div>
            <div>Take a before photo [3</div>
            <div>Do your thing [4</div>
            <div>Take an after photo [5</div>
            <div>Follow up on this webpage once you’re done [6</div>
        </div>
    </div>
</div>
{/if}

<style type="text/scss">
    .request-details {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: white;
        z-index: 2;
    }

    .details {
        padding: 1.5em;
    }

    .header {
        display: flex;

        a[name="back"] {
            flex:1;
        }
    }

    .instructions {
        text-align: right;
        font-size: 0.75em;
    }
</style>