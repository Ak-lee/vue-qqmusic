<template>
  <scroll class="suggest" :data="result" :beforeScroll="beforeScroll" @beforeScroll="listScroll" :pullup="pullup" @scrollToEnd="searchMore" ref="suggest">
    <ul class="suggest-list">
      <li class="suggest-item" @click="selectItem(item)" v-for="item in result" :key="item.singermid || item.songmid" :data="item.url || ''">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show = "hasMore" title = ""></loading>
    </ul>
    <div v-show="!hasMore && !result.length" class="no-result-wrapper">
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </scroll>
</template>

<script>
import { search } from 'api/search'
import { ERR_OK } from 'api/config'
import { createSong, processSongUrl, isValidMusic } from 'common/js/song'
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import Singer from 'common/js/singer'
import { mapMutations, mapActions } from 'vuex'
import NoResult from 'base/no-result/no-result'

const TYPE_SINGER = 'singer'
const perpage = 20

export default {
  props: {
    query: {
      type: String,
      default: ''
    },
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      page: 1,
      result: [],
      pullup: true,
      hasMore: true,
      beforeScroll: true
    }
  },
  methods: {
    search(isReload) {
      // 新的字段search专用，要添加下一页搜索结果，请使用 searchMore
      let showSinger
      if (!isReload) {
        showSinger = this.showSinger
        this.hasMore = true
        this.page = 1
        this.$refs.suggest.scrollTo(0, 0)
      }
      search(this.query, this.page, showSinger, perpage).then((res) => {
        if (res.code === ERR_OK) {
          this._checkMore(res.data)
          this._genResult(res.data).then((result) => {
            if (isReload) {
              this.result = this.result.concat(result)
            } else {
              this.result = result
            }
            if (this.result.length < perpage && this.hasMore) {
              this.page = this.page + 1
              showSinger = false
              this.search(true) // 递归调用自己
            }
          })
        }
      })
    },
    searchMore() {
      if (!this.hasMore) {
        return
      }
      this.page = this.page + 1
      search(this.query, this.page, false, perpage).then((res) => {
        if (res.code === ERR_OK) {
          this._checkMore(res.data)
          this._genResult(res.data).then((result) => {
            this.result = this.result.concat(result)
          })
        }
      })
    },
    selectItem(item) {
      if (item.type === TYPE_SINGER) {
        const singer = new Singer({
          id: item.singermid,
          name: item.singername
        })
        this.setSinger(singer)
        this.$router.push({
          path: `/search/${singer.id}`
        })
      } else {
        this.insertSong(item)
      }
      this.$emit('select')
    },
    getIconCls(item) {
      if (item.type === TYPE_SINGER) {
        return 'icon-mine'
      } else {
        return 'icon-music'
      }
    },
    getDisplayName(item) {
      if (item.type === TYPE_SINGER) {
        return item.singername
      } else {
        return item.name + '-' + item.singer
      }
    },
    listScroll() {
      this.$emit('listScroll')
    },
    refresh() {
      this.$refs.suggest.refresh()
    },
    _checkMore(data) {
      const song = data.song
      if (!song.list.length || (song.curnum + (song.curpage - 1) * perpage) >= song.totalnum) {
        this.hasMore = false
      }
    },
    _genResult(data) {
      return new Promise((resolve, reject) => {
        let ret = []
        if (data.zhida && data.zhida.singerid) {
          ret.push({
            ...data.zhida,
            type: TYPE_SINGER
          })
        }
        if (data.song) {
          let songs = this._normalizeSongs(data.song.list)
          processSongUrl(songs).then((res) => {
            resolve(ret.concat(res))
          }).catch((e) => {
            reject(e)
          })
        }
      })
    },
    _normalizeSongs(list) {
      let ret = []
      list.forEach((musicData) => {
        if (isValidMusic(musicData)) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    }),
    ...mapActions([
      'insertSong'
    ])
  },
  watch: {
    query() {
      this.search()
    }
  },
  components: {
    Scroll,
    Loading,
    NoResult
  }
}
</script>

<style lang="stylus" scoped>
@import "~common/stylus/variable"
@import "~common/stylus/mixin"

.suggest
  height: 100%
  overflow: hidden
  .suggest-list
    padding: 0 30px
    .suggest-item
      display: flex
      align-items: center
      padding-bottom: 20px
    .icon
      flex: 0 0 30px
      width: 30px
      [class^="icon-"]
        font-size: 14px
        color: $color-text-d
    .name
      flex: 1
      font-size: $font-size-medium
      color: $color-text-d
      overflow: hidden
      .text
        no-wrap()
  .no-result-wrapper
    position: absolute
    width: 100%
    top: 50%
    transform: translateY(-50%)
</style>
