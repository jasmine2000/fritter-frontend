<!-- Default page that also displays freets -->

<template>
  <main>
    <section>
      <header>
        <div class="left">
          <h2>
            {{ username }}
          </h2>
        </div>
      </header>
      <span>
        <button
          :class="freetView ? 'selected' : ''"
          @click="freetView=true"
        >
          View Freets
        </button>
        <button
          :class="!freetView ? 'selected' : ''"
          @click="freetView=false"
        >
          View Collections
        </button>
      </span>
      <section
        v-if="freetView"
      >
        <section
          v-if="userFreets.length"
        >
          <FreetComponent
            v-for="freet in userFreets"
            :key="freet.id"
            :freet="freet"
          />
        </section>
        <article
          v-else
        >
          <h3>No freets found.</h3>
        </article>
      </section>
      <section
        v-else
      >
        <button
          v-for="collection in userCollections"
          :key="collection._id.toString()"
          :class="collection._id == currentCollection ? 'selected' : ''"
          @click="getCollectionFreets(collection._id.toString())"
        >
          {{ collection.title }}
        </button>
        <section
          v-if="currentCollectionFreets.length"
        >
          <FreetComponent
            v-for="freet in currentCollectionFreets"
            :key="freet.id"
            :freet="freet"
          />
        </section>
        <article
          v-else
        >
          <h3>No freets in Collection.</h3>
        </article>
      </section>
    </section>
  </main>
</template>

<script>
import FreetComponent from '@/components/Freet/FreetComponent.vue';

export default {
  name: 'ProfilePage',
  components: {FreetComponent},
  data() {
    return {
      username: this.$route.params.username,
      freetView: true,
      userFreets: [],
      userCollections: [],
      currentCollection: 0,
      currentCollectionFreets: []
    };
  },
  mounted() {
    this.getFreets();
    this.getCollections();
  },
  methods: {
    async getFreets() {
      /**
       * Gets given user's freets
       */
      try {
        const r = await fetch(`/api/freets/?username=${this.username}`);
        if (!r.ok) {
          throw new Error(res.error);
        }
        
        const res = await r.json();
        this.userFreets = res;

      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
    async getCollections() {
      /**
       * Gets given user's collections
       */
      try {
        const r = await fetch(`/api/collections?username=${this.username}`);
        if (!r.ok) {
          throw new Error(res.error);
        }
        
        const res = await r.json();
        this.userCollections = res;
        this.getCollectionFreets(this.userCollections[0]._id.toString());

      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
    async getCollectionFreets(currentCollection) {
      /**
       * Gets freets in given collection
       */
      this.currentCollection = currentCollection;

      try {
        const r = await fetch(`/api/freets/collection/${this.currentCollection}`);
        if (!r.ok) {
          throw new Error(res.error);
        }
        
        const res = await r.json();
        this.currentCollectionFreets = res;

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

header, header > * {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

button {
    margin-right: 10px;
}

section .scrollbox {
  flex: 1 0 50vh;
  padding: 3%;
  overflow-y: scroll;
}

.selected {
  background-color:lightblue
}
</style>
