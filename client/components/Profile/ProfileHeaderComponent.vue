<!-- Profile page -->

<template>
  <article class="profileHeader">
    <div class="name">
      <h2 class="left">
        @{{ username }}
      </h2>
      <article
        v-if="$store.state.username && username != $store.state.username"
        class="followButton"
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
    </div>
    <button 
      v-if="view"
      class="followStats"
      @click="$emit('toggleView')"
    >
      {{ followers + followerDiff }} Followers | {{ following }} Following
    </button>
    <button 
      v-else
      class="followStats"
      @click="$emit('toggleView')"
    >
      &#8592; Back to Freets
    </button>
  </article>
</template>
  
<script>

export default {
  name: 'ProfileHeaderComponent',
  components: {},
  props: {
    username: {type: String, required: true},
    view: {type: Boolean, required: true},
  },
  data() {
    return {
        isFollowing: false,
        followerDiff: 0,
        followers: 0,
        following: 0
    };
  },
  watch: {
    username: function() {
      this.getFollowData();
    }
  },
  mounted() {
    this.getFollowData();
  },
  methods: {
    async getFollowData() {
      this.getIsFollowing();
      this.getFollowingCount();
      this.getFollowerCount();
    },
    async getIsFollowing() {
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
    async getFollowingCount() {
      /**
       * Get the people the user is following
       */
      try {
        const r = await fetch(`/api/users/${this.username}/following`);
        const res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }
        this.following = res.following.length;

      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
    async getFollowerCount() {
      /**
       * Get the followers of the user
       */
      try {
        const r = await fetch(`/api/users/${this.username}/followers`);
        const res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }
        
        this.followers = res.followers.length;

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
      this.followerDiff += 1;
      this.$emit('refreshFollowers');
    },
    async unfollow() {
      /**
       * follow user
       */
      this.request({method: 'DELETE'});
      this.isFollowing = false;
      this.followerDiff -= 1;
      this.$emit('refreshFollowers');
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

.followButton {
  margin-left: 20px;
  font-weight: bold;
  font-size: medium;
}
.profileHeader {
  border-bottom: 1px solid #111;
  padding: 20px;
  padding-left: 40px;
  position: relative;
}

.name {
  display: flex;
  align-items: center;
}

.followStats {
  background-color: white;
}
</style>
  