<!-- Form for getting freets (all, from user) (inline style) -->

<script>
import InlineForm from '@/components/common/InlineForm.vue';

export default {
  name: 'AddCollectionForm',
  mixins: [InlineForm],
  data() {
    return {value: ""};
  },
  methods: {
    async submit() {
      if (!this.value) {
        const error = 'Error: Title is empty.';
        this.$set(this.alerts, error, 'error'); // Set an alert to be the error text, timeout of 3000 ms
        setTimeout(() => this.$delete(this.alerts, error), 3000);
        return;
      }
      const options = {
        method: 'POST', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({title: this.value}),
      };
      try {
        const r = await fetch(`/api/collections`, options);
        const res = await r.json();

        if (!r.ok) {
          throw new Error(res.error);
        }

        this.$emit('refresh', true);
        this.value = "";
  
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    }
  }
};
</script>
