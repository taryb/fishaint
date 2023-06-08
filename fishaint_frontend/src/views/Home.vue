<template>
  <v-textarea v-model="notes" label="Notes" rows="5"></v-textarea>
  <v-btn @click="submitLog">Submit</v-btn>
</template>

<script>
export default {
  data() {
    return {
      notes: ''
    };
  },
  methods: {
    async submitLog() {
      try {
        await fetch('http://localhost:8003/api/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notes: this.notes })
        });
        // Log submitted successfully, perform any desired actions
      } catch (error) {
        console.error('Error submitting log:', error);
        // Handle error
      }
    }
  }
}
</script>
