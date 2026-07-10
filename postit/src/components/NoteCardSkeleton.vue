<template>
  <div class="postit-skeleton" aria-hidden="true">
    <div class="postit-skeleton__line postit-skeleton__line--title"></div>
    <div class="postit-skeleton__line"></div>
    <div class="postit-skeleton__line postit-skeleton__line--short"></div>
  </div>
</template>

<script setup></script>

<style scoped>
.postit-skeleton {
  border-radius: var(--radius-md);
  padding: 22px 18px 18px;
  min-height: 180px;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: var(--shadow-sm);
}

.postit-skeleton__line {
  height: 14px;
  border-radius: 999px;
  margin-bottom: 12px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.5) 25%, rgba(255, 255, 255, 0.85) 37%, rgba(255, 255, 255, 0.5) 63%);
  background-size: 400% 100%;
  animation: skeletonShimmer 1.4s ease infinite;
}

.postit-skeleton__line--title {
  height: 20px;
  width: 60%;
}

.postit-skeleton__line--short {
  width: 40%;
}

@keyframes skeletonShimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style>
