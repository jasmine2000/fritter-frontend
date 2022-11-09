<!-- Reusable component representing a single freet and its actions -->
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
  <article
    class="freet"
  >
    <header>
      <h3 class="author">
        <router-link 
          :to="'/profile/'+ freet.author"
        >
          @{{ freet.author }}
        </router-link>
      </h3>
    </header>
    <textarea
      v-if="editing"
      class="content"
      :value="draft"
      @input="draft = $event.target.value"
    />
    <div
      v-if="editing"
      :class="characterCount <= 10 ? 'goodColor' : 'badColor'"
    >
      {{ characterCount }} / 10 allowed edits made 
      <div class="tooltip">
        ?
        <span class="tooltiptext">
          edits = minimum adds, deletes, or swaps it takes to get from original to edited
        </span>
      </div>
    </div>
    <p
      v-else
      class="content"
    >
      {{ freet.content }}
    </p>
    <div
      v-if="$store.state.username === freet.author"
      class="actions"
    >
      <button
        v-if="editing"
        @click="submitEdit"
      >
        ✅ Save changes
      </button>
      <button
        v-if="editing"
        @click="stopEditing"
      >
        🚫 Discard changes
      </button>
      <button
        v-if="!editing"
        @click="startEditing"
      >
        ✏️ Edit
      </button>
      <button 
        v-if="!editing"
        @click="deleteFreet"
      >
        🗑️ Delete
      </button>
    </div>
    <p class="info">
      Posted at {{ freet.dateModified }}
      <i v-if="freet.edited">(edited)</i>
    </p>
    <ReactionComponent 
      v-if="$store.state.username != null"
      :freet="freet"
      @refreshContent="$emit('refreshContent')"
    />
    <section class="alerts">
      <article
        v-for="(status, alert, index) in alerts"
        :key="index"
        :class="status"
      >
        <p>{{ alert }}</p>
      </article>
    </section>
  </article>
</template>

<script>
import ReactionComponent from '@/components/Freet/ReactionComponent.vue'

export default {
  name: 'FreetComponent',
  components: {ReactionComponent},
  props: {
    // Data from the stored freet
    freet: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      editing: false, // Whether or not this freet is in edit mode
      draft: this.freet.content, // Potentially-new content for this freet
      alerts: {}, // Displays success/error messages encountered during freet modification
    };
  },
  computed: {
    characterCount() {
      const minEdits = (originalContent, newContent) => {
        if (!originalContent && !newContent) {
          return 0;
        }

        if (!originalContent || !newContent) {
          return originalContent.length + newContent.length;
        }

        if (originalContent.startsWith(newContent.charAt(0))) {
          return minEdits(originalContent.slice(1), newContent.slice(1));
        }

        const add = minEdits(originalContent, newContent.slice(1));
        const remove = minEdits(originalContent.slice(1), newContent);
        const replace = minEdits(originalContent.slice(1), newContent.slice(1));
        
        return 1 + Math.min(add, remove, replace);
      }

      return minEdits(this.freet.originalContent, this.draft);
    }
  },
  methods: {
    startEditing() {
      /**
       * Enables edit mode on this freet.
       */
      this.editing = true; // Keeps track of if a freet is being edited
      this.draft = this.freet.content; // The content of our current "draft" while being edited
    },
    stopEditing() {
      /**
       * Disables edit mode on this freet.
       */
      this.editing = false;
      this.draft = this.freet.content;
    },
    deleteFreet() {
      /**
       * Deletes this freet.
       */
      const params = {
        method: 'DELETE',
        callback: () => {
          this.$store.commit('alert', {
            message: 'Successfully deleted freet!', status: 'success'
          });
        }
      };
      this.request(params);
    },
    submitEdit() {
      /**
       * Updates freet to have the submitted draft content.
       */
      if (this.freet.content === this.draft) {
        const error = 'Error: Edited freet content should be different than current freet content.';
        this.$set(this.alerts, error, 'error'); // Set an alert to be the error text, timeout of 3000 ms
        setTimeout(() => this.$delete(this.alerts, error), 3000);
        return;
      } else if (this.characterCount > 10) {
        const error = 'Error: Freet has been edited too much.';
        this.$set(this.alerts, error, 'error'); // Set an alert to be the error text, timeout of 3000 ms
        setTimeout(() => this.$delete(this.alerts, error), 3000);
        return;
      }

      const params = {
        method: 'PATCH',
        message: 'Successfully edited freet!',
        body: JSON.stringify({content: this.draft}),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
      this.request(params);
    },
    async request(params) {
      /**
       * Submits a request to the freet's endpoint
       * @param params - Options for the request
       * @param params.body - Body for the request, if it exists
       * @param params.callback - Function to run if the the request succeeds
       */
      const options = {
        method: params.method, headers: {'Content-Type': 'application/json'}
      };
      if (params.body) {
        options.body = params.body;
      }

      try {
        const r = await fetch(`/api/freets/${this.freet._id}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.editing = false;
        this.$store.commit('refreshFreets');

        params.callback();
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    }
  }
};
</script>

<style scoped>
.freet {
  border-top: 1px solid #111;
  padding: 20px;
  padding-top: 10px;
  position: relative;
  margin-top: 10px;
}

.info {
  color:gray;
  font-size: small;
}

.goodColor {
  color: green;
  margin-top: 5px;
  margin-bottom: 10px;
}

.badColor {
  color: red;
  margin-top: 5px;
  margin-bottom: 10px;
}

/* Tooltip container */
.tooltip {
  color: gray;
  position: relative;
  display: inline-block;
  border-bottom: 1px dotted black; /* If you want dots under the hoverable text */
}

/* Tooltip text */
.tooltip .tooltiptext {
  visibility: hidden;
  width: 200px;
  background-color: black;
  color: #fff;
  text-align: center;
  padding: 5px;
  border-radius: 6px;
  bottom: 100%;
  margin-left: -20px;
 
  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 1;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext {
  visibility: visible;
}
</style>