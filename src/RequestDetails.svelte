<script>
    import utils from '../scripts/utils.js'
    export let request;
    let { imgURL, address, category, business, artist, insta, contact, createDate } = request.properties;
    $: console.log(request);

    function unselectRequest() {
        request = null;
    }
</script>

{#if request}
<div class="request-details">
    <div class="imgs">
        {#if imgURL}
            <img src={imgURL} alt="Mural by {artist}"/>
        {/if}
    </div>
    <div class="props">
        {#if category === "Completed Install"}
            {#if artist} Art &copy; {artist}, {createDate ? new Date(createDate).getFullYear() : 2020}{/if}
        {/if}
    </div>
    <div class="details">
        <div class="header">
            <a on:click={unselectRequest} name="back">&larr; Recent Requests</a>
            {#if category !== "Completed Install"}
            <a class="serve-cta primary-btn" href="https://forms.gle/8PXQH6BJRzT5FAGy8">
                Serve<br>
                <!-- <span class="sub"><span class="volunteer-count">None</span> have joined</span> -->
            </a>
            {/if}
        </div>

        <h2>{category}</h2>
        <div class="business-details">
            <div class="business-location"></div>
            <div class="business">
                <div class="business-name">
                {#if business}
                    <div class="request-name">{business}</div>
                {/if}</div>
                <a class="business-address" href="https://www.google.com/maps/place/{address.replace(/ /g, '+')}" target="_blank">{address}</a>
            </div>
        </div>
        <div class="contact">
            {#if contact.phone}
            <div>Contact: {contact.phone}</div>
            {/if}
            <div>
                {#if createDate}
                {@html utils.formatDate(new Date(createDate)) }
                {:else}
                June 2020
                {/if}
            </div>
        </div><br>
        {#if category === "Art Requests"}
        <div class="instructions">
            <strong>How to serve in 6 steps</strong>
            <ol>
                <li>Call the business to arrange logistics</li>
                <li>Fill out This Form once you’re ready</li>
                <li>Take a before photo</li>
                <li>Do your thing</li>
                <li>Take an after photo</li>
                <li>Follow up on this webpage once you’re done</li>
            </ol>
        </div>
        {/if}
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
        overflow: auto;

        .imgs img {
            max-width: 100%;
        }
    }

    .props {
        text-align: right;
        padding: 1em;
        padding-bottom: 0;
    }

    .details {
        padding: 1.5em;
        padding-top: 0;
    }

    .header {
        display: flex;

        a[name="back"] {
            flex:1;
        }
    }

    .instructions {
        font-size: 0.75em;

        ol {
            list-style: none;
            counter-reset: my-awesome-counter;
            padding: 0;

            li {
                counter-increment: my-awesome-counter;
                text-align: right;
                position: relative;
                padding: 2px 20px 2px 0;
                
            }
            li::before {
                content: '['counter(my-awesome-counter);
                font-weight: bold;
                position: absolute;
                right: 0;
                top: 3px;
            }
        }
    }

</style>