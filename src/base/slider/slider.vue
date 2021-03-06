<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot>
      </slot>
    </div>
    <div class="dots">
      <span class="dot" :key='index' v-for='(item, index) in dots' :class='{active: currentPageIndex === index}'>
      </span>
    </div>
  </div>
</template>

<script>
import BScroll from 'better-scroll'
import { addClass } from 'common/js/dom'

export default {
  props: {
    loop: {
      type: Boolean,
      default: true
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    interval: {
      type: Number,
      default: 4000
    }
  },
  data() {
    return {
      dots: [],
      currentPageIndex: 0, // 从0开始,
      sliderLength: 0
    }
  },
  mounted() {
    setTimeout(() => {
      this._setSliderWidth()
      this._initDots()
      this._initSlider()
      this._setSliderWidth()
      this.slider.refresh()
      if (this.autoplay) {
        this._play()
      }
    }, 20)
    window.addEventListener('resize', () => {
      if (!this.slider) {
        return
      }
      this._setSliderWidth()
      this.slider.refresh()
    })
  },
  methods: {
    _setSliderWidth() {
      this.children = this.$refs.sliderGroup.children
      this.sliderLength = this.sliderLength || this.children.length
      let width = 0
      let silderWidth = document.body.clientWidth
      for (let i = 0; i < this.children.length; i++) {
        let child = this.children[i]
        addClass(child, 'slider-item')
        child.style.width = silderWidth + 'px'
        width += silderWidth
      }
      this.$refs.sliderGroup.style.width = width + 'px'
    },
    _initDots() {
      this.dots = new Array(this.children.length)
    },
    _initSlider() {
      this.slider = new BScroll(this.$refs.slider, {
        scrollX: true,
        scrollY: false,
        momentum: false,
        snap: {
          loop: this.loop,
          threshold: 0.3,
          speed: 400
        },
        click: true
      })

      this.slider.on('scrollEnd', () => {
        let pageIndex = this.slider.getCurrentPage().pageX
        this.currentPageIndex = pageIndex
        if (this.autoplay) {
          clearTimeout(this.timer)
          this._play()
        }
      })
    },
    _play() {
      this.timer = setTimeout(() => {
        // let pageIndex = this.currentPageIndex + 1
        // pageIndex = pageIndex % this.sliderLength
        // this.slider.goToPage(pageIndex, 0, 400)
        this.slider.next(400)
      }, this.interval)
    },
    destroyed() {
      clearTimeout(this.timer)
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~common/stylus/variable'

.slider {
  min-height: 1px;
  position relative;
  overflow hidden;
  .slider-group {
    position: relative;
    overflow: hidden;
    white-space: nowrap;

    .slider-item {
      float: left;
      box-sizing: border-box;
      overflow: hidden;
      text-align: center;

      a {
        display: block;
        width: 100%;
        overflow: hidden;
        text-decoration: none;
      }

      img {
        display: block;
        width: 100%;
      }
    }
  }

  .dots {
    position: absolute;
    right: 0;
    left: 0;
    bottom: 12px;
    text-align: center;
    font-size: 0;

    .dot {
      display: inline-block;
      margin: 0 4px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: $color-text-l;

      &.active {
        width: 20px;
        border-radius: 5px;
        background: $color-text-ll;
      }
    }
  }
}
</style>