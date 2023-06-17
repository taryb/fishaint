<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="mt-5">
          <v-card-title class="text-center">Fishing Log Entry</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="submitFish">
              <v-text-field v-model="fish.species" label="Fish Species" required></v-text-field>
              <v-text-field v-model="fish.size" label="Size" type="number" required></v-text-field>
              <v-text-field v-model="fish.weight" label="Weight" type="number" required></v-text-field>
              <v-text-field v-model="fish.location" label="Location" required></v-text-field>
              <v-text-field v-model="fish.date" label="Date" type="date" required></v-text-field>
              <v-file-input
                label="Image"
                accept="image/*"
                prepend-icon="mdi-camera"
                @change="handleImageUpload"
                required
              ></v-file-input>
              <v-btn type="submit" color="primary" class="mt-5" block>Submit</v-btn>
            </v-form>
          </v-card-text>
        </v-card>

        <v-card class="mt-5">
          <v-card-title class="text-center">Fishing Log Entries</v-card-title>
          <v-card-text>
            <v-simple-table>
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left">Species</th>
                    <th class="text-left">Size</th>
                    <th class="text-left">Weight</th>
                    <th class="text-left">Location</th>
                    <th class="text-left">Date</th>
                    <th class="text-left">Image</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="entry in fishEntries" :key="entry._id">
                    <td>{{ entry.species }}</td>
                    <td>{{ entry.size }}</td>
                    <td>{{ entry.weight }}</td>
                    <td>{{ entry.location }}</td>
                    <td>{{ formatDate(entry.date) }}</td>
                    <td><img :src="entry.image" alt="Fish Image" height="60"></td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-container fluid>
      <p class="text-center mt-5">Last Updated: {{ lastUpdated }}</p>
    </v-container>

    <v-snackbar v-model="snackbar" :timeout="3000" :color="snackbarColor">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      fish: {
        species: '',
        size: '',
        weight: '',
        location: '',
        date: '',
        image: null
      },
      fishEntries: [],
      snackbar: false,
      snackbarMessage: '',
      snackbarColor: ''
    };
  },
  computed: {
    lastUpdated() {
      const date = new Date();
      return date.toLocaleString();
    }
  },
  methods: {
    async submitFish() {
      try {
        const formData = new FormData();
        formData.append('species', this.fish.species);
        formData.append('size', this.fish.size);
        formData.append('weight', this.fish.weight);
        formData.append('location', this.fish.location);
        formData.append('date', this.fish.date);
        formData.append('image', this.fish.image);

        const response = await fetch('https://fishaint-backend.vercel.app/api/logs', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          this.clearForm();
          this.fetchFishEntries();
          this.showSnackbar('Fish submitted successfully', 'success');
        } else {
          this.showSnackbar('Error submitting fish', 'error');
        }
      } catch (error) {
        console.error('Error submitting fish:', error);
        this.showSnackbar('Error submitting fish', 'error');
      }
    },
    async fetchFishEntries() {
      try {
        const response = await fetch('https://fishaint-backend.vercel.app/api/logs');
        if (response.ok) {
          this.fishEntries = await response.json();
        } else {
          this.showSnackbar('Error fetching fish entries', 'error');
        }
      } catch (error) {
        console.error('Error fetching fish entries:', error);
        this.showSnackbar('Error fetching fish entries', 'error');
      }
    },
    handleImageUpload(event) {
      const file = event.target.files[0];
      this.fish.image = file;
    },
    clearForm() {
      this.fish.species = '';
      this.fish.size = '';
      this.fish.weight = '';
      this.fish.location = '';
      this.fish.date = '';
      this.fish.image = null;
    },
    formatDate(date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString(undefined, options);
    },
    showSnackbar(message, color) {
      this.snackbarMessage = message;
      this.snackbarColor = color;
      this.snackbar = true;
    }
  },
  mounted() {
    this.fetchFishEntries();
  }
};
</script>

<style scoped>
.text-left {
  text-align: left;
}
</style>
