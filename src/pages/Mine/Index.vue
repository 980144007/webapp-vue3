<template>
  <div class="page-mine-container">
    <div class="content">
      <van-cell-group>
        <van-cell :title="$t('mine.profile')" is-link />
        <van-cell :title="$t('mine.settings')" is-link />
        <van-cell :title="$t('mine.logout')" is-link />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup name="Mine">

</script>

<style lang="less" scoped>
.page-mine-container {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;

  .header {
    padding: 20px;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    // border-bottom: 1px solid #eee;

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }
  }

  .content {
    padding: 20px;
  }
}
</style>
