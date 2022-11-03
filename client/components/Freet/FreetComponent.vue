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
    <p
      v-if="editing"
      :class="characterCount <= 10 ? 'goodColor' : 'badColor'"
    >
      {{ characterCount }} / 10 allowed edits made
    </p>
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
      <button @click="deleteFreet">
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
      isLiked: false,
      filteredCollections: []
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

      return minEdits(this.freet.content, this.draft);
    }
  },
  mounted() {
    this.setReactionState()
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
    },
    setReactionState() {
      // set like state
      this.isLiked = this.freet.likes.map(obj => obj.userId).includes(this.$store.state.userId);
      // set which collections freet is in
      for (const collection of this.$store.state.userCollections) {
        if (collection.title == "Likes") continue;
        var hasFreet = false;
        for (const postId of collection.posts) {
          if (postId == this.freet._id) {
            hasFreet = true;
            break;
          }
        }
        const newCollection = {_id: collection._id, title: collection.title, hasFreet};
        this.filteredCollections.push(newCollection);
      }
    },
    async toggleLikeState() {
      let param = "";
      const options = {
        headers: {'Content-Type': 'application/json'}
      };
      if (this.isLiked) {
        options.method = "DELETE";
        param = this.freet._id;
      } else {
        options.method = "POST";
        options.body = JSON.stringify({postId: this.freet._id});
      }

      try {
        const r = await fetch(`/api/likes/${param}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.isLiked = !this.isLiked;
        this.$store.commit('refreshFreets');

      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
    async toggleCollectionMembership(collection) {
      const options = {
        method: collection.hasFreet ? 'DELETE' : 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({freetId: this.freet._id})
      };

      try {
        const r = await fetch(`/api/collections/${collection.title}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }
        
        const message = collection.hasFreet ? `Removed From ${collection.title}` : `Added to ${collection.title}`;
        this.$set(this.alerts, message, 'success');
        setTimeout(() => this.$delete(this.alerts, message), 3000);

        collection.hasFreet = !collection.hasFreet;

      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
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

.reactions {
  display: flex;
  justify-content: center;
  align-items: flex-end;;
}

.reactionButtons {
  padding: 0;
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 10px;
  font-size: medium;
  font-weight: bold;
  background-color: white;
  margin-right: 10px;
}

/* Dropup Button */
.dropbtn {
  background-color: #3498DB;
  color: white;
  padding: 16px;
  font-size: 16px;
  border: none;
}

/* The container <div> - needed to position the dropup content */
.dropup {
  display: inline-block;
  position: relative;
}

/* Dropup content (Hidden by Default) */
.dropup-content {
  display: none;
  position: absolute;
  bottom: 50px;
  background-color: #f1f1f1;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}

/* Links inside the dropup */
.dropup-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

/* Change color of dropup links on hover */
.dropup-content a:hover {background-color: #ddd}

/* Show the dropup menu on hover */
.dropup:hover .dropup-content {
  display: block;
}

/* Change the background color of the dropup button when the dropup content is shown */
.dropup:hover .dropbtn {
  background-color: #2980B9;
}

.goodColor {
  color: green
}

.badColor {
  color: red
}
</style>