<!-- Profile page -->

<template>
  <main>
    <section>
      <ProfileHeaderComponent
        :username="$route.params.username"
        :view="freet_follow"
        :following="following.length"
        :followers="followers.length"
        @toggleView="freet_follow=!freet_follow"
        @refreshFollowers="toggleFollow"
      />
      <section
        v-if="freet_follow"
      >
        <section 
          class="categories"
        >
          <button
            :class="author_collection ? 'selected' : ''"
            @click="author_collection=true"
          >
            View Freets
          </button>
          <button
            :class="!author_collection ? 'selected' : ''"
            @click="author_collection=false"
          >
            View Collections
          </button>
        </section>
        <section
          v-if="author_collection"
        >
          <UserFreetsComponent
            :username="$route.params.username"
          />
        </section>
        <section
          v-else
        >
          <UserCollectionsComponent
            :username="$route.params.username"
          />
        </section>
      </section>
      <section
        v-else
      >
        <section 
          class="categories"
        >
          <button
            :class="followers_following ? 'selected' : ''"
            @click="followers_following=true"
          >
            Followers
          </button>
          <button
            :class="!followers_following ? 'selected' : ''"
            @click="followers_following=false"
          >
            Following
          </button>
        </section>
        <section
          class="userList"
        >
          <div
            v-if="followers_following"
          >
            <h3 
              v-for="user in followers"
              :key="user.id"
            >
              <router-link 
                :to="'/profile/'+ user.name"
              >
                @{{ user.name }}
              </router-link>
            </h3>
          </div>
          <div
            v-else
          >
            <h3 
              v-for="user in following"
              :key="user.id"
            >
              <router-link 
                :to="'/profile/'+ user.name"
              >
                @{{ user.name }}
              </router-link>
            </h3>
          </div>
        </section>
      </section>
    </section>
  </main>
</template>

<script>
import UserFreetsComponent from '@/components/Profile/UserFreetsComponent.vue';
import UserCollectionsComponent from '@/components/Profile/UserCollectionsComponent.vue';
import ProfileHeaderComponent from '@/components/Profile/ProfileHeaderComponent.vue';

export default {
  name: 'ProfilePage',
  components: {UserFreetsComponent, UserCollectionsComponent, ProfileHeaderComponent},
  data() {
    return {
      username: this.$route.params.username,
      freet_follow: true,
      author_collection: true,
      followers_following: true,
      following: [],
      followers: [],
    };
  },
  watch: {
    $route: function() {
      this.freet_follow = true;
      this.author_collection = true;
      this.followers_following = true;
      this.getFollowers();
      this.getFollowing();
    }
  },
  mounted() {
    this.getFollowers();
    this.getFollowing();
  },
  methods: {
    async getFollowing() {
      /**
       * Get the people the user is following
       */
      try {
        const r = await fetch(`/api/users/${this.username}/following`);
        const res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }

        this.following = res.following.map(user => ({id: user._id.toString(), name: user.username}));

      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
    async getFollowers() {
      /**
       * Get the followers of the user
       */
      try {
        const r = await fetch(`/api/users/${this.username}/followers`);
        const res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }
        
        this.followers = res.followers.map(user => ({id: user._id.toString(), name: user.username}));

      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
    toggleFollow () {
      const userIdString = this.$store.state.userId.toString();
      if (this.followers.map(user => user.id).includes(userIdString)) {
        this.followers = this.followers.filter(user => user.id != userIdString);
      } else {
        this.followers.push({id: userIdString, name: this.$store.state.username});
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

header, header > * {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

button {
  flex-direction: column;
  font-size: large;
  display: flex;
  width: 100%;
  align-items: center;
  padding: 10px;
  border-style: none;
  margin: 5px;
}

.userList {
  margin-left: 50px
}

.categories {
  display: flex;
  flex-direction: row;
  margin-top: 15px;
  margin-bottom: 15px;
}
</style>
