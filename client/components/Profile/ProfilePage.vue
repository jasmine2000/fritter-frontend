<!-- Profile page -->

<template>
  <main>
    <section>
      <ProfileHeaderComponent />
      <section class="sections">
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
      </section>
      <section
        v-if="freetView"
      >
        <FreetListComponent />
      </section>
      <section
        v-else
      >
        <CollectionsComponent />
      </section>
    </section>
  </main>
</template>

<script>
import FreetListComponent from '@/components/Profile/FreetListComponent.vue';
import CollectionsComponent from '@/components/Profile/CollectionsComponent.vue';
import ProfileHeaderComponent from '@/components/Profile/ProfileHeaderComponent.vue';

export default {
  name: 'ProfilePage',
  components: {FreetListComponent, CollectionsComponent, ProfileHeaderComponent},
  data() {
    return {
      username: this.$route.params.username,
      freetView: true,
    };
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

.sections {
  display: flex;
  flex-direction: row;
  margin-top: 15px;
  margin-bottom: 15px;
}
</style>
