<script lang="ts" setup>
  const state = reactive({ count: 1, tegan: 'Tegan' })
  const yesCount = ref(0)
  const noCount = ref(0)
  const question = ref('How are you feeling today?')
  const answer = ref('')
  
  function increment() {
    state.count++
  }

  function changeName() {
    state.tegan = state.tegan === 'Jordan' ? 'Tegan' : 'Jordan'
  }

  watchEffect(async () => {
    if (question.value.indexOf('?') > 0) {
      answer.value = "thinking..."
      try {
        const res = await $fetch<Promise<{ answer: string}>>('https://yesno.wtf/api')
        answer.value = res.answer
        answer.value === 'yes' ? yesCount.value++ : noCount.value++
      } catch (error) {
        answer.value = "Error, something went wrong"
      }
    }
  })
</script>

<template>
  <h1>{{state.tegan}}</h1>
  <h2>{{yesCount}}</h2>
  <h2>{{noCount}}</h2>
  <button @click="changeName">
    Toggle Name
  </button>
  <button @click="increment">
    Increment
  </button>

  <p>Ask your question:</p>
  <input type="text" v-model="question">
  <p>The answer is: {{answer}}</p>
</template>