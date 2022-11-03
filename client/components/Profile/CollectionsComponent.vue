<!-- Default page that also displays freets -->

<template>
  <section v-if="isEditing">
    <section class="collectionTitles">
      <button
        class="editButton"
        @click="isEditing=false"
      >
        Stop Editing
      </button>
      <section class="collectionTitlesOnly">
        <button
          v-for="collection in userCollections"
          :key="collection._id.toString()"
          :class="'collectionTitlesEditing'"
          @click="deleteCollection(collection.title, collection._id.toString())"
        >
          {{ collection.title }} &#10005;
        </button>
      </section>
      <p>
        Click a Collection to delete it. Add a new collection below.
      </p>
      <AddCollectionForm
        ref="addCollectionForm"
        value=""
        placeholder="Enter Collection Name"
        button="Add Collection"
        @refresh="getCollections"
      />
    </section>
  </section>
  <section v-else>
    <section class="collectionTitles">
      <button
        v-if="username==$store.state.username"
        class="editButton"
        @click="isEditing=true"
      >
        Edit Collections
      </button>
      <section class="collectionTitlesOnly">
        <button
          v-for="collection in userCollections"
          :key="collection._id.toString()"
          :class="collection._id == currentCollection ? 'selected' : ''"
          @click="getCollectionFreets(collection._id.toString())"
        >
          {{ collection.title }}
        </button>
      </section>
    </section>
    <article
      v-if="currentCollectionFreets.length"
    >
      <FreetComponent
        v-for="freet in currentCollectionFreets"
        :key="freet.id"
        :freet="freet"
      />
    </article>
    <article
      v-else
    >
      <h3>No freets in Collection.</h3>
    </article>
  </section>
</template>
  
<script>
import FreetComponent from '@/components/Freet/FreetComponent.vue';
import AddCollectionForm from '@/components/Profile/AddCollectionForm.vue';

export default {
name: 'CollectionsComponent',
components: {FreetComponent, AddCollectionForm},
data() {
  return {
    username: this.$route.params.username,
    userCollections: [],
    currentCollection: null,
    currentCollectionFreets: [],
    isEditing: false
  };
},
mounted() {
  this.getCollections();
},
methods: {
  async getCollections() {
    /**
     * Gets given user's collections
     */
    try {
      const r = await fetch(`/api/collections?username=${this.username}`);
      const res = await r.json();
      if (!r.ok) {
        throw new Error(res.error);
      }

      this.userCollections = res;
      this.getCollectionFreets(this.currentCollection ? this.currentCollection : this.userCollections[0]._id.toString());

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
  },
  async deleteCollection(collectionName, collectionId) {
    /**
     * Gets freets in given collection
     */
    await this.collectionRequest('DELETE', collectionName);
    if (this.currentCollection == collectionId) {
      this.currentCollection = this.userCollections[0]._id.toString();
    }
    this.$store.commit('refreshCollections');
  },
  async collectionRequest(method, collectionName) {
    /**
     * Gets freets in given collection
     */
     const options = {
        method: method, headers: {'Content-Type': 'application/json'}
      };
    try {
      const r = await fetch(`/api/collections/${collectionName}`, options);
      const res = await r.json();
      if (!r.ok) {
        throw new Error(res.error);
      }
      this.getCollections();

    } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
    }
  }
}
};
</script>

<style scoped>

.collectionTitles {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.collectionTitlesOnly {
  display: flex;
  justify-content: center;
}

.collectionTitlesEditing {
  /* display: flex;
  justify-content: center; */
  background-color: tomato;
}

.editButton {
  margin-bottom: 10px;
  font-weight: bold;
}

p {
  font-size: small;
}

header, header > * {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

button {
  margin-right: 5px;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 20px;
  padding-right: 20px;
  border-style: none;
}

section .scrollbox {
  flex: 1 0 50vh;
  padding: 3%;
  overflow-y: scroll;
}
</style>
  