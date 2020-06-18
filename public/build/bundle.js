
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.23.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Map.svelte generated by Svelte v3.23.2 */

    const { document: document_1 } = globals;
    const file = "src/Map.svelte";

    function create_fragment(ctx) {
    	let script;
    	let script_src_value;
    	let t;
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			script = element("script");
    			t = space();
    			div = element("div");
    			if (script.src !== (script_src_value = "https://api.mapbox.com/mapbox-gl-js/v1.10.1/mapbox-gl.js")) attr_dev(script, "src", script_src_value);
    			add_location(script, file, 45, 4, 1501);
    			attr_dev(div, "id", "main-map");
    			attr_dev(div, "class", "themap svelte-1b2krjc");
    			add_location(div, file, 47, 0, 1615);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document_1.head, script);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(script, "load", /*initMap*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(script);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let map = null;

    	onMount(() => {
    		// temporary goofy map sizing, feel free to delete this and size the map a better way
    		document.getElementById("main-map").style.height = window.innerHeight - 175 + "px";
    	});

    	const initMap = () => {
    		mapboxgl.accessToken = "pk.eyJ1IjoiYWFyb25oYW5zIiwiYSI6ImNrYjVrc3hvaTBkMW4zMW1wbXU4emlhaHgifQ.3Zpqx654l58G4Fl_IdcXLA";

    		map = new mapboxgl.Map({
    				container: "main-map",
    				style: "mapbox://styles/mapbox/dark-v9",
    				center: [-122.269326, 37.808404],
    				zoom: 13
    			});

    		getRequests();
    	};

    	const getRequests = () => {
    		fetch("data/art-requests.json").then(response => response.json()).then(geojson => {
    			// add markers to map
    			geojson.features.forEach(function (marker) {
    				// create a HTML element for each feature
    				var el = document.createElement("div");

    				el.className = "art-request-marker";

    				// make a marker for each feature and add to the map
    				new mapboxgl.Marker(el).setLngLat(marker.geometry.coordinates).setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>Art request</h3><p>${marker.properties.title}</p><p>${marker.properties.address}</p>`)).addTo(map); // add popups
    			});
    		});
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Map> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Map", $$slots, []);
    	$$self.$capture_state = () => ({ onMount, map, initMap, getRequests });

    	$$self.$inject_state = $$props => {
    		if ("map" in $$props) map = $$props.map;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [initMap];
    }

    class Map$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Map",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* src/Tabs.svelte generated by Svelte v3.23.2 */
    const file$1 = "src/Tabs.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "tabs");
    			add_location(div, file$1, 47, 0, 1063);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const TABS = {};

    function instance$1($$self, $$props, $$invalidate) {
    	const tabs = [];
    	const panels = [];
    	const selectedTab = writable(null);
    	const selectedPanel = writable(null);

    	setContext(TABS, {
    		registerTab: tab => {
    			tabs.push(tab);
    			selectedTab.update(current => current || tab);

    			onDestroy(() => {
    				const i = tabs.indexOf(tab);
    				tabs.splice(i, 1);

    				selectedTab.update(current => current === tab
    				? tabs[i] || tabs[tabs.length - 1]
    				: current);
    			});
    		},
    		registerPanel: panel => {
    			panels.push(panel);
    			selectedPanel.update(current => current || panel);

    			onDestroy(() => {
    				const i = panels.indexOf(panel);
    				panels.splice(i, 1);

    				selectedPanel.update(current => current === panel
    				? panels[i] || panels[panels.length - 1]
    				: current);
    			});
    		},
    		selectTab: tab => {
    			const i = tabs.indexOf(tab);
    			selectedTab.set(tab);
    			selectedPanel.set(panels[i]);
    		},
    		selectedTab,
    		selectedPanel
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tabs> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Tabs", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		TABS,
    		setContext,
    		onDestroy,
    		writable,
    		tabs,
    		panels,
    		selectedTab,
    		selectedPanel
    	});

    	return [$$scope, $$slots];
    }

    class Tabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/TabList.svelte generated by Svelte v3.23.2 */

    const file$2 = "src/TabList.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "tab-list");
    			add_location(div, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TabList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TabList", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, $$slots];
    }

    class TabList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabList",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/TabPanel.svelte generated by Svelte v3.23.2 */

    // (11:0) {#if $selectedPanel === panel}
    function create_if_block(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(11:0) {#if $selectedPanel === panel}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$selectedPanel*/ ctx[0] === /*panel*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$selectedPanel*/ ctx[0] === /*panel*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$selectedPanel*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $selectedPanel;
    	const panel = {};
    	const { registerPanel, selectedPanel } = getContext(TABS);
    	validate_store(selectedPanel, "selectedPanel");
    	component_subscribe($$self, selectedPanel, value => $$invalidate(0, $selectedPanel = value));
    	registerPanel(panel);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TabPanel> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TabPanel", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		TABS,
    		panel,
    		registerPanel,
    		selectedPanel,
    		$selectedPanel
    	});

    	return [$selectedPanel, panel, selectedPanel, $$scope, $$slots];
    }

    class TabPanel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabPanel",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Tab.svelte generated by Svelte v3.23.2 */
    const file$3 = "src/Tab.svelte";

    function create_fragment$4(ctx) {
    	let button;
    	let button_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*$$props*/ ctx[4].class) + " svelte-zcw3tr"));
    			toggle_class(button, "selected", /*$selectedTab*/ ctx[0] === /*tab*/ ctx[1]);
    			add_location(button, file$3, 35, 0, 601);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*$$props*/ 16 && button_class_value !== (button_class_value = "" + (null_to_empty(/*$$props*/ ctx[4].class) + " svelte-zcw3tr"))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*$$props, $selectedTab, tab*/ 19) {
    				toggle_class(button, "selected", /*$selectedTab*/ ctx[0] === /*tab*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $selectedTab;
    	const tab = {};
    	const { registerTab, selectTab, selectedTab } = getContext(TABS);
    	validate_store(selectedTab, "selectedTab");
    	component_subscribe($$self, selectedTab, value => $$invalidate(0, $selectedTab = value));
    	registerTab(tab);
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Tab", $$slots, ['default']);
    	const click_handler = () => selectTab(tab);

    	$$self.$set = $$new_props => {
    		$$invalidate(4, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("$$scope" in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		TABS,
    		tab,
    		registerTab,
    		selectTab,
    		selectedTab,
    		$selectedTab
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(4, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);

    	return [
    		$selectedTab,
    		tab,
    		selectTab,
    		selectedTab,
    		$$props,
    		$$scope,
    		$$slots,
    		click_handler
    	];
    }

    class Tab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tab",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/RequestCard.svelte generated by Svelte v3.23.2 */

    const file$4 = "src/RequestCard.svelte";

    // (13:8) {#if request.properties.businessName}
    function create_if_block$1(ctx) {
    	let div;
    	let t_value = /*request*/ ctx[0].properties.businessName + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "request-name");
    			add_location(div, file$4, 13, 12, 678);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*request*/ 1 && t_value !== (t_value = /*request*/ ctx[0].properties.businessName + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(13:8) {#if request.properties.businessName}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div3;
    	let t0;
    	let div1;
    	let t1;
    	let div0;
    	let t2;
    	let a;
    	let t4;
    	let div2;
    	let button;
    	let t5;
    	let br;
    	let mounted;
    	let dispose;
    	let if_block1 = /*request*/ ctx[0].properties.businessName && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			t0 = space();
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			a = element("a");
    			a.textContent = "See Details";
    			t4 = space();
    			div2 = element("div");
    			button = element("button");
    			t5 = text("Serve");
    			br = element("br");
    			attr_dev(div0, "class", "create-date");
    			add_location(div0, file$4, 15, 8, 766);
    			attr_dev(a, "name", "more-details");
    			add_location(a, file$4, 16, 8, 827);
    			attr_dev(div1, "class", "request-details svelte-1ryoyvr");
    			add_location(div1, file$4, 11, 4, 590);
    			add_location(br, file$4, 20, 13, 1004);
    			attr_dev(button, "class", "serve-cta primary-btn svelte-1ryoyvr");
    			add_location(button, file$4, 19, 8, 952);
    			attr_dev(div2, "class", "request-cta svelte-1ryoyvr");
    			add_location(div2, file$4, 18, 4, 918);
    			attr_dev(div3, "class", "request-card svelte-1ryoyvr");
    			add_location(div3, file$4, 7, 0, 291);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			div0.innerHTML = /*formattedDate*/ ctx[2];
    			append_dev(div1, t2);
    			append_dev(div1, a);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, button);
    			append_dev(button, t5);
    			append_dev(button, br);

    			if (!mounted) {
    				dispose = listen_dev(
    					a,
    					"click",
    					function () {
    						if (is_function(/*selectedRequest*/ ctx[1] = /*request*/ ctx[0])) (/*selectedRequest*/ ctx[1] = /*request*/ ctx[0]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (/*request*/ ctx[0].properties.businessName) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(div1, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { request } = $$props;
    	let { selectedRequest } = $$props;
    	let createDate = new Date(request.properties.createDate);

    	let formattedDate = createDate
    	? `${createDate.getMonth()}/${createDate.getDay()} &middot; ${createDate.getHours()}:${createDate.getMinutes()}`
    	: "";

    	const writable_props = ["request", "selectedRequest"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<RequestCard> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("RequestCard", $$slots, []);

    	$$self.$set = $$props => {
    		if ("request" in $$props) $$invalidate(0, request = $$props.request);
    		if ("selectedRequest" in $$props) $$invalidate(1, selectedRequest = $$props.selectedRequest);
    	};

    	$$self.$capture_state = () => ({
    		request,
    		selectedRequest,
    		createDate,
    		formattedDate
    	});

    	$$self.$inject_state = $$props => {
    		if ("request" in $$props) $$invalidate(0, request = $$props.request);
    		if ("selectedRequest" in $$props) $$invalidate(1, selectedRequest = $$props.selectedRequest);
    		if ("createDate" in $$props) createDate = $$props.createDate;
    		if ("formattedDate" in $$props) $$invalidate(2, formattedDate = $$props.formattedDate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [request, selectedRequest, formattedDate];
    }

    class RequestCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { request: 0, selectedRequest: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RequestCard",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*request*/ ctx[0] === undefined && !("request" in props)) {
    			console.warn("<RequestCard> was created without expected prop 'request'");
    		}

    		if (/*selectedRequest*/ ctx[1] === undefined && !("selectedRequest" in props)) {
    			console.warn("<RequestCard> was created without expected prop 'selectedRequest'");
    		}
    	}

    	get request() {
    		throw new Error("<RequestCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set request(value) {
    		throw new Error("<RequestCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedRequest() {
    		throw new Error("<RequestCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedRequest(value) {
    		throw new Error("<RequestCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/RequestDetails.svelte generated by Svelte v3.23.2 */

    const file$5 = "src/RequestDetails.svelte";

    // (5:0) {#if request}
    function create_if_block$2(ctx) {
    	let section;
    	let div0;
    	let t0;
    	let div7;
    	let div1;
    	let a;
    	let t2;
    	let button;
    	let t3;
    	let br;
    	let t4;
    	let span1;
    	let span0;
    	let t6;
    	let t7;
    	let h2;
    	let t9;
    	let div6;
    	let div2;
    	let t10;
    	let div5;
    	let div3;
    	let t11;
    	let div4;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			t0 = space();
    			div7 = element("div");
    			div1 = element("div");
    			a = element("a");
    			a.textContent = "Recent Requests";
    			t2 = space();
    			button = element("button");
    			t3 = text("Serve");
    			br = element("br");
    			t4 = space();
    			span1 = element("span");
    			span0 = element("span");
    			span0.textContent = "None";
    			t6 = text(" have joined");
    			t7 = space();
    			h2 = element("h2");
    			h2.textContent = "Clean Up Request";
    			t9 = space();
    			div6 = element("div");
    			div2 = element("div");
    			t10 = space();
    			div5 = element("div");
    			div3 = element("div");
    			t11 = space();
    			div4 = element("div");
    			attr_dev(div0, "class", "request-imgs");
    			add_location(div0, file$5, 6, 4, 72);
    			attr_dev(a, "click", "back");
    			attr_dev(a, "href", "");
    			add_location(a, file$5, 9, 8, 184);
    			add_location(br, file$5, 11, 17, 289);
    			attr_dev(span0, "class", "volunteer-count");
    			add_location(span0, file$5, 12, 30, 324);
    			attr_dev(span1, "class", "sub");
    			add_location(span1, file$5, 12, 12, 306);
    			attr_dev(button, "class", "serve-cta primary-btn");
    			add_location(button, file$5, 10, 8, 233);
    			attr_dev(div1, "class", "request-header");
    			add_location(div1, file$5, 8, 8, 147);
    			add_location(h2, file$5, 16, 8, 427);
    			attr_dev(div2, "class", "business-location");
    			add_location(div2, file$5, 18, 12, 504);
    			attr_dev(div3, "class", "business-name");
    			add_location(div3, file$5, 20, 16, 593);
    			attr_dev(div4, "class", "business-address");
    			add_location(div4, file$5, 21, 16, 643);
    			attr_dev(div5, "class", "business");
    			add_location(div5, file$5, 19, 12, 554);
    			attr_dev(div6, "class", "business-details");
    			add_location(div6, file$5, 17, 8, 461);
    			attr_dev(div7, "class", "request-details");
    			add_location(div7, file$5, 7, 4, 109);
    			add_location(section, file$5, 5, 0, 58);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(section, t0);
    			append_dev(section, div7);
    			append_dev(div7, div1);
    			append_dev(div1, a);
    			append_dev(div1, t2);
    			append_dev(div1, button);
    			append_dev(button, t3);
    			append_dev(button, br);
    			append_dev(button, t4);
    			append_dev(button, span1);
    			append_dev(span1, span0);
    			append_dev(span1, t6);
    			append_dev(div7, t7);
    			append_dev(div7, h2);
    			append_dev(div7, t9);
    			append_dev(div7, div6);
    			append_dev(div6, div2);
    			append_dev(div6, t10);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			append_dev(div5, t11);
    			append_dev(div5, div4);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(5:0) {#if request}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let if_block_anchor;
    	let if_block = /*request*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*request*/ ctx[0]) {
    				if (if_block) ; else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { request } = $$props;
    	const writable_props = ["request"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<RequestDetails> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("RequestDetails", $$slots, []);

    	$$self.$set = $$props => {
    		if ("request" in $$props) $$invalidate(0, request = $$props.request);
    	};

    	$$self.$capture_state = () => ({ request });

    	$$self.$inject_state = $$props => {
    		if ("request" in $$props) $$invalidate(0, request = $$props.request);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [request];
    }

    class RequestDetails extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { request: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RequestDetails",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*request*/ ctx[0] === undefined && !("request" in props)) {
    			console.warn("<RequestDetails> was created without expected prop 'request'");
    		}
    	}

    	get request() {
    		throw new Error("<RequestDetails>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set request(value) {
    		throw new Error("<RequestDetails>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var type="FeatureCollection";var features=[{type:"Feature",geometry:{type:"Point",coordinates:["-122.259792,37.821127"]},properties:{category:"Art Requests",address:"3356 Piedmont Ave, Oakland, CA 94611",imgURL:"https://drive.google.com/open?id=14OUe6IBg6l22jFyQpjP1KpxCs-u6gUcX",contact:{name:"Michele weiner",phone:"5104888564"},createDate:"6/12/2020 16:50:14"}},{type:"Feature",geometry:{type:"Point",coordinates:[-122.274688,37.797367]},properties:{category:"Art Requests",address:"400 Broadway, Oakland, CA",imgURL:"https://drive.google.com/open?id=1Bv_vSIhdnY6LIaMSAOpVtbj0UbfCssFh",contact:{name:"Aaron Hans",phone:"92599899425"},createDate:"6/7/2020 14:17:42"}}];var artReqestJSON = {type:type,features:features};

    /* src/Requests.svelte generated by Svelte v3.23.2 */

    const file$6 = "src/Requests.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (16:12) <Tab class="cleanup">
    function create_default_slot_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Clean Ups");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(16:12) <Tab class=\\\"cleanup\\\">",
    		ctx
    	});

    	return block;
    }

    // (17:12) <Tab class="art">
    function create_default_slot_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Art Requests");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(17:12) <Tab class=\\\"art\\\">",
    		ctx
    	});

    	return block;
    }

    // (15:8) <TabList>
    function create_default_slot_3(ctx) {
    	let tab0;
    	let t;
    	let tab1;
    	let current;

    	tab0 = new Tab({
    			props: {
    				class: "cleanup",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab1 = new Tab({
    			props: {
    				class: "art",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tab0.$$.fragment);
    			t = space();
    			create_component(tab1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tab0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(tab1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tab0_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				tab0_changes.$$scope = { dirty, ctx };
    			}

    			tab0.$set(tab0_changes);
    			const tab1_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				tab1_changes.$$scope = { dirty, ctx };
    			}

    			tab1.$set(tab1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab0.$$.fragment, local);
    			transition_in(tab1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab0.$$.fragment, local);
    			transition_out(tab1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tab0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(tab1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(15:8) <TabList>",
    		ctx
    	});

    	return block;
    }

    // (20:8) <TabPanel>
    function create_default_slot_2(ctx) {
    	let p;
    	let t1;
    	let div;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Tap serve if you’d like to get involved with a clean up request, then share with your neighbors.";
    			t1 = space();
    			div = element("div");
    			add_location(p, file$6, 20, 12, 692);
    			attr_dev(div, "class", "cleanup-requests");
    			add_location(div, file$6, 21, 12, 808);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(20:8) <TabPanel>",
    		ctx
    	});

    	return block;
    }

    // (30:16) {#each artRequests as request, i}
    function create_each_block(ctx) {
    	let requestcard;
    	let updating_selectedRequest;
    	let current;

    	function requestcard_selectedRequest_binding(value) {
    		/*requestcard_selectedRequest_binding*/ ctx[2].call(null, value);
    	}

    	let requestcard_props = { request: /*request*/ ctx[4] };

    	if (/*selectedRequest*/ ctx[0] !== void 0) {
    		requestcard_props.selectedRequest = /*selectedRequest*/ ctx[0];
    	}

    	requestcard = new RequestCard({ props: requestcard_props, $$inline: true });
    	binding_callbacks.push(() => bind(requestcard, "selectedRequest", requestcard_selectedRequest_binding));

    	const block = {
    		c: function create() {
    			create_component(requestcard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(requestcard, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const requestcard_changes = {};

    			if (!updating_selectedRequest && dirty & /*selectedRequest*/ 1) {
    				updating_selectedRequest = true;
    				requestcard_changes.selectedRequest = /*selectedRequest*/ ctx[0];
    				add_flush_callback(() => updating_selectedRequest = false);
    			}

    			requestcard.$set(requestcard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(requestcard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(requestcard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(requestcard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(30:16) {#each artRequests as request, i}",
    		ctx
    	});

    	return block;
    }

    // (27:8) <TabPanel>
    function create_default_slot_1(ctx) {
    	let p;
    	let t1;
    	let div;
    	let current;
    	let each_value = /*artRequests*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Tap serve if you are an artist interested in claiming this spot.";
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(p, file$6, 27, 12, 927);
    			attr_dev(div, "class", "art-requests");
    			add_location(div, file$6, 28, 12, 1011);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*artRequests, selectedRequest*/ 3) {
    				each_value = /*artRequests*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(27:8) <TabPanel>",
    		ctx
    	});

    	return block;
    }

    // (14:4) <Tabs>
    function create_default_slot(ctx) {
    	let tablist;
    	let t0;
    	let tabpanel0;
    	let t1;
    	let tabpanel1;
    	let current;

    	tablist = new TabList({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabpanel0 = new TabPanel({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabpanel1 = new TabPanel({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tablist.$$.fragment);
    			t0 = space();
    			create_component(tabpanel0.$$.fragment);
    			t1 = space();
    			create_component(tabpanel1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tablist, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tabpanel0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tabpanel1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tablist_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				tablist_changes.$$scope = { dirty, ctx };
    			}

    			tablist.$set(tablist_changes);
    			const tabpanel0_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				tabpanel0_changes.$$scope = { dirty, ctx };
    			}

    			tabpanel0.$set(tabpanel0_changes);
    			const tabpanel1_changes = {};

    			if (dirty & /*$$scope, selectedRequest*/ 129) {
    				tabpanel1_changes.$$scope = { dirty, ctx };
    			}

    			tabpanel1.$set(tabpanel1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tablist.$$.fragment, local);
    			transition_in(tabpanel0.$$.fragment, local);
    			transition_in(tabpanel1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tablist.$$.fragment, local);
    			transition_out(tabpanel0.$$.fragment, local);
    			transition_out(tabpanel1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tablist, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tabpanel0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tabpanel1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(14:4) <Tabs>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let section;
    	let h1;
    	let t1;
    	let tabs;
    	let t2;
    	let requestdetails;
    	let updating_request;
    	let current;

    	tabs = new Tabs({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function requestdetails_request_binding(value) {
    		/*requestdetails_request_binding*/ ctx[3].call(null, value);
    	}

    	let requestdetails_props = {};

    	if (/*selectedRequest*/ ctx[0] !== void 0) {
    		requestdetails_props.request = /*selectedRequest*/ ctx[0];
    	}

    	requestdetails = new RequestDetails({
    			props: requestdetails_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(requestdetails, "request", requestdetails_request_binding));

    	const block = {
    		c: function create() {
    			section = element("section");
    			h1 = element("h1");
    			h1.textContent = "↓ Recent Posts";
    			t1 = space();
    			create_component(tabs.$$.fragment);
    			t2 = space();
    			create_component(requestdetails.$$.fragment);
    			attr_dev(h1, "class", "header");
    			add_location(h1, file$6, 12, 4, 471);
    			add_location(section, file$6, 11, 0, 457);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h1);
    			append_dev(section, t1);
    			mount_component(tabs, section, null);
    			insert_dev(target, t2, anchor);
    			mount_component(requestdetails, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tabs_changes = {};

    			if (dirty & /*$$scope, selectedRequest*/ 129) {
    				tabs_changes.$$scope = { dirty, ctx };
    			}

    			tabs.$set(tabs_changes);
    			const requestdetails_changes = {};

    			if (!updating_request && dirty & /*selectedRequest*/ 1) {
    				updating_request = true;
    				requestdetails_changes.request = /*selectedRequest*/ ctx[0];
    				add_flush_callback(() => updating_request = false);
    			}

    			requestdetails.$set(requestdetails_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabs.$$.fragment, local);
    			transition_in(requestdetails.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabs.$$.fragment, local);
    			transition_out(requestdetails.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(tabs);
    			if (detaching) detach_dev(t2);
    			destroy_component(requestdetails, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let artRequests = artReqestJSON.features;
    	let selectedRequest;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Requests> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Requests", $$slots, []);

    	function requestcard_selectedRequest_binding(value) {
    		selectedRequest = value;
    		$$invalidate(0, selectedRequest);
    	}

    	function requestdetails_request_binding(value) {
    		selectedRequest = value;
    		$$invalidate(0, selectedRequest);
    	}

    	$$self.$capture_state = () => ({
    		Tabs,
    		TabList,
    		TabPanel,
    		Tab,
    		RequestCard,
    		RequestDetails,
    		artReqestJSON,
    		artRequests,
    		selectedRequest
    	});

    	$$self.$inject_state = $$props => {
    		if ("artRequests" in $$props) $$invalidate(1, artRequests = $$props.artRequests);
    		if ("selectedRequest" in $$props) $$invalidate(0, selectedRequest = $$props.selectedRequest);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selectedRequest,
    		artRequests,
    		requestcard_selectedRequest_binding,
    		requestdetails_request_binding
    	];
    }

    class Requests extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Requests",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/Modal.svelte generated by Svelte v3.23.2 */
    const file$7 = "src/Modal.svelte";

    function create_fragment$8(ctx) {
    	let div0;
    	let t0;
    	let div3;
    	let div2;
    	let div1;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			t1 = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "modal-background svelte-k5wn40");
    			add_location(div0, file$7, 41, 0, 890);
    			attr_dev(div1, "class", "close icon-close svelte-k5wn40");
    			add_location(div1, file$7, 45, 2, 1046);
    			attr_dev(div2, "class", "modal-content svelte-k5wn40");
    			add_location(div2, file$7, 44, 1, 1016);
    			attr_dev(div3, "class", "modal svelte-k5wn40");
    			attr_dev(div3, "role", "dialog");
    			attr_dev(div3, "aria-modal", "true");
    			add_location(div3, file$7, 43, 0, 945);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div2, t1);

    			if (default_slot) {
    				default_slot.m(div2, null);
    			}

    			/*div3_binding*/ ctx[5](div3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "keydown", /*handle_keydown*/ ctx[2], false, false, false),
    					listen_dev(div0, "click", /*close*/ ctx[1], false, false, false),
    					listen_dev(div1, "click", /*close*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    			if (default_slot) default_slot.d(detaching);
    			/*div3_binding*/ ctx[5](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	const close = () => dispatch("close");
    	let modal;

    	const handle_keydown = e => {
    		if (e.key === "Escape") {
    			close();
    			return;
    		}

    		if (e.key === "Tab") {
    			// trap focus
    			const nodes = modal.querySelectorAll("*");

    			const tabbable = Array.from(nodes).filter(n => n.tabIndex >= 0);
    			let index = tabbable.indexOf(document.activeElement);
    			if (index === -1 && e.shiftKey) index = 0;
    			index += tabbable.length + (e.shiftKey ? -1 : 1);
    			index %= tabbable.length;
    			tabbable[index].focus();
    			e.preventDefault();
    		}
    	};

    	const previously_focused = typeof document !== "undefined" && document.activeElement;

    	if (previously_focused) {
    		onDestroy(() => {
    			previously_focused.focus();
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Modal", $$slots, ['default']);

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			modal = $$value;
    			$$invalidate(0, modal);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onDestroy,
    		dispatch,
    		close,
    		modal,
    		handle_keydown,
    		previously_focused
    	});

    	$$self.$inject_state = $$props => {
    		if ("modal" in $$props) $$invalidate(0, modal = $$props.modal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [modal, close, handle_keydown, $$scope, $$slots, div3_binding];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.23.2 */
    const file$8 = "src/App.svelte";

    // (15:0) {#if showRequestTypeModal}
    function create_if_block_1(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modal.$on("close", /*close_handler*/ ctx[2]);

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(15:0) {#if showRequestTypeModal}",
    		ctx
    	});

    	return block;
    }

    // (16:0) <Modal on:close="{() => showRequestTypeModal = false}">
    function create_default_slot_1$1(ctx) {
    	let a0;
    	let i0;
    	let t0;
    	let t1;
    	let hr;
    	let t2;
    	let a1;
    	let i1;
    	let t3;

    	const block = {
    		c: function create() {
    			a0 = element("a");
    			i0 = element("i");
    			t0 = text("Clean Up");
    			t1 = space();
    			hr = element("hr");
    			t2 = space();
    			a1 = element("a");
    			i1 = element("i");
    			t3 = text("Art Install");
    			attr_dev(i0, "class", "icon-earthquake-fill svelte-1h326bi");
    			add_location(i0, file$8, 16, 91, 409);
    			attr_dev(a0, "class", "request-cleanup-cta svelte-1h326bi");
    			attr_dev(a0, "href", "https://forms.gle/489s69zb24GaNyfK6");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$8, 16, 1, 319);
    			add_location(hr, file$8, 17, 1, 459);
    			attr_dev(i1, "class", "icon-paint-brush-fill svelte-1h326bi");
    			add_location(i1, file$8, 18, 87, 552);
    			attr_dev(a1, "class", "request-art-cta svelte-1h326bi");
    			attr_dev(a1, "href", "https://forms.gle/VKyexQDKkciK2At59");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$8, 18, 1, 466);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a0, anchor);
    			append_dev(a0, i0);
    			append_dev(a0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, a1, anchor);
    			append_dev(a1, i1);
    			append_dev(a1, t3);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(a1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(16:0) <Modal on:close=\\\"{() => showRequestTypeModal = false}\\\">",
    		ctx
    	});

    	return block;
    }

    // (23:0) {#if showAboutModal}
    function create_if_block$3(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modal.$on("close", /*close_handler_1*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(23:0) {#if showAboutModal}",
    		ctx
    	});

    	return block;
    }

    // (24:0) <Modal on:close="{() => showAboutModal = false}">
    function create_default_slot$1(ctx) {
    	let h2;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let strong;
    	let t4;
    	let a0;
    	let t6;
    	let t7;
    	let p2;
    	let t8;
    	let br;
    	let t9;
    	let a1;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "About CommunityServe";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "CommunityServe was built by Neighbors in the Oakland area in solidarity with #BLM and the George Floyd protests.";
    			t3 = space();
    			p1 = element("p");
    			strong = element("strong");
    			t4 = text("There is work to be done. ");
    			a0 = element("a");
    			a0.textContent = "Join Us";
    			t6 = text(".");
    			t7 = space();
    			p2 = element("p");
    			t8 = text("Get Involved");
    			br = element("br");
    			t9 = space();
    			a1 = element("a");
    			a1.textContent = "Artist Sign Up";
    			add_location(h2, file$8, 24, 1, 693);
    			add_location(p0, file$8, 25, 1, 724);
    			attr_dev(a0, "href", "https://forms.gle/H3UJcCATeU4CU85y5");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$8, 26, 38, 882);
    			add_location(strong, file$8, 26, 4, 848);
    			add_location(p1, file$8, 26, 1, 845);
    			add_location(br, file$8, 27, 16, 986);
    			attr_dev(a1, "href", "https://forms.gle/guyxLC6d2G9SBkzM9");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$8, 28, 1, 992);
    			add_location(p2, file$8, 27, 1, 971);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, strong);
    			append_dev(strong, t4);
    			append_dev(strong, a0);
    			append_dev(p1, t6);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, p2, anchor);
    			append_dev(p2, t8);
    			append_dev(p2, br);
    			append_dev(p2, t9);
    			append_dev(p2, a1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(p2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(24:0) <Modal on:close=\\\"{() => showAboutModal = false}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let main;
    	let map;
    	let t0;
    	let requests;
    	let t1;
    	let t2;
    	let t3;
    	let footer;
    	let a0;
    	let h1;
    	let t5;
    	let div2;
    	let div0;
    	let t6;
    	let a1;
    	let t8;
    	let t9;
    	let div1;
    	let a2;
    	let current;
    	let mounted;
    	let dispose;
    	map = new Map$1({ $$inline: true });
    	requests = new Requests({ $$inline: true });
    	let if_block0 = /*showRequestTypeModal*/ ctx[0] && create_if_block_1(ctx);
    	let if_block1 = /*showAboutModal*/ ctx[1] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(map.$$.fragment);
    			t0 = space();
    			create_component(requests.$$.fragment);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			footer = element("footer");
    			a0 = element("a");
    			h1 = element("h1");
    			h1.textContent = "Submit Request";
    			t5 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t6 = text("A community funded project to support historically ");
    			a1 = element("a");
    			a1.textContent = "red-lined";
    			t8 = text(" black & brown cities in direct action through service & art.");
    			t9 = space();
    			div1 = element("div");
    			a2 = element("a");
    			a2.textContent = "About";
    			add_location(main, file$8, 9, 0, 196);
    			add_location(h1, file$8, 34, 95, 1199);
    			attr_dev(a0, "name", "request-cta");
    			attr_dev(a0, "class", "request-help-cta");
    			add_location(a0, file$8, 34, 1, 1105);
    			attr_dev(a1, "href", "https://www.npr.org/2017/05/03/526655831/a-forgotten-history-of-how-the-u-s-government-segregated-america");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$8, 36, 58, 1315);
    			add_location(div0, file$8, 36, 2, 1259);
    			attr_dev(a2, "name", "about-link");
    			add_location(a2, file$8, 37, 28, 1560);
    			attr_dev(div1, "class", "footer-links");
    			add_location(div1, file$8, 37, 2, 1534);
    			attr_dev(div2, "class", "footer-content");
    			add_location(div2, file$8, 35, 1, 1228);
    			add_location(footer, file$8, 33, 0, 1095);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(map, main, null);
    			append_dev(main, t0);
    			mount_component(requests, main, null);
    			insert_dev(target, t1, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, footer, anchor);
    			append_dev(footer, a0);
    			append_dev(a0, h1);
    			append_dev(footer, t5);
    			append_dev(footer, div2);
    			append_dev(div2, div0);
    			append_dev(div0, t6);
    			append_dev(div0, a1);
    			append_dev(div0, t8);
    			append_dev(div2, t9);
    			append_dev(div2, div1);
    			append_dev(div1, a2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", /*click_handler*/ ctx[4], false, false, false),
    					listen_dev(a2, "click", /*click_handler_1*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showRequestTypeModal*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*showRequestTypeModal*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t2.parentNode, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*showAboutModal*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*showAboutModal*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t3.parentNode, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(map.$$.fragment, local);
    			transition_in(requests.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(map.$$.fragment, local);
    			transition_out(requests.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(map);
    			destroy_component(requests);
    			if (detaching) detach_dev(t1);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(footer);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let showRequestTypeModal = false;
    	let showAboutModal = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	const close_handler = () => $$invalidate(0, showRequestTypeModal = false);
    	const close_handler_1 = () => $$invalidate(1, showAboutModal = false);
    	const click_handler = () => $$invalidate(0, showRequestTypeModal = true);
    	const click_handler_1 = () => $$invalidate(1, showAboutModal = true);

    	$$self.$capture_state = () => ({
    		Map: Map$1,
    		Requests,
    		Modal,
    		showRequestTypeModal,
    		showAboutModal
    	});

    	$$self.$inject_state = $$props => {
    		if ("showRequestTypeModal" in $$props) $$invalidate(0, showRequestTypeModal = $$props.showRequestTypeModal);
    		if ("showAboutModal" in $$props) $$invalidate(1, showAboutModal = $$props.showAboutModal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		showRequestTypeModal,
    		showAboutModal,
    		close_handler,
    		close_handler_1,
    		click_handler,
    		click_handler_1
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
