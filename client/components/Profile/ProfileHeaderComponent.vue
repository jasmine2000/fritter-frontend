<!-- Profile page -->

<template>
  <article class="profileHeader">
    <span>
      <h2 class="left">
        {{ username }}
      </h2>
      <article
        v-if="$store.state.username && username != $store.state.username"
      >
        <button
          v-if="isFollowing"
          class="selected"
          @click="unfollow"
        >
          Unfollow
        </button>
        <button
          v-else
          @click="follow"
        >
          Follow
        </button>
      </article>
    </span>
  </article>
</template>
  
<script>

export default {
  name: 'ProfileHeaderComponent',
  components: {},
  data() {
    return {
        username: this.$route.params.username,
        isFollowing: false,
    };
  },
  mounted() {
    this.getState();
  },
  methods: {
    async getState() {
      /**
       * See if user is following this user
       */
      try {
        const r = await fetch(`/api/follow/${this.username}`);
        const res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }
        
        this.isFollowing = res.isFollowing;

      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
    async follow() {
      /**
       * follow user
       */
      this.request({method: 'POST'});
      this.isFollowing = true;
    },
    async unfollow() {
      /**
       * follow user
       */
      this.request({method: 'DELETE'});
      this.isFollowing = false;
    },
    async request(params) {
      /**
       * Submits a request to the follow's endpoint
       * @param params - Options for the request
       * @param params.body - Body for the request, if it exists
       */
      const options = {
        method: params.method, headers: {'Content-Type': 'application/json'}
      };

      try {
        const r = await fetch(`/api/follow/${this.username}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    }
  }
};
</script>

<style scoped>
section {
display: flex;
flex-direction: column;
}

.profileHeader {
    border: 1px solid #111;
    padding: 20px;
    position: relative;
}

.selected {
background-color:lightblue
}
</style>
  