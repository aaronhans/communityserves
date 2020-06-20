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
        {#if request.properties.category === "Art Requests"}
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