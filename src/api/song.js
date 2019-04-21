import { getUid } from 'common/js/uid'
import axios from 'axios'
import { commonParams, ERR_OK } from './config'

export function getSongsUrl(songs) {
  const url = '/api/getPurlUrl'
  const mids = []
  const types = []

  songs.forEach((song) => {
    mids.push(song.mid)
    types.push(0)
  })

  const urlMid = genUrlMid(mids, types)

  const data = Object.assign({}, commonParams, {
    g_tk: 5381,
    format: 'json',
    platform: 'h5',
    needNewCode: 1,
    uin: 0
  })

  return new Promise((resolve, reject) => {
    let tryTime = 3
    function request() {
      return axios.post(url, {
        comm: data,
        req_0: urlMid
      }).then((response) => {
        const res = response.data
        if (res.code === ERR_OK) {
          let urlMid = res.req_0
          if (urlMid && urlMid.code === ERR_OK) {
            const prulMap = {}
            urlMid.data.midurlinfo.forEach((item) => {
              if (item.purl) {
                prulMap[item.songmid] = item.purl
              }
            })
            if (Object.keys(prulMap).length > 0) {
              resolve(prulMap)
            } else {
              retry()
            }
          } else {
            retry()
          }
        }
      })
    }
    function retry() {
      console.log('retry')
      if (--tryTime >= 0) {
        request()
      } else {
        reject(new Error('Can not get songs url'))
      }
    }
    request()
  })
}

export function getLyric(mid) {
  const url = '/api/lyric'

  const data = Object.assign({}, commonParams, {
    songmid: mid,
    pcachetime: new Date(),
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    g_tk: 67232076,
    format: 'json'
  })
  return axios.get(url, {
    params: data
  }).then(res => {
    return Promise.resolve(res.data)
  })
}

function genUrlMid(mids, types) {
  const guid = getUid()
  return {
    module: 'vkey.GetVkeyServer',
    method: 'CgiGetVkey',
    param: {
      guid,
      songmid: mids,
      songtype: types,
      uin: '0',
      loginflag: 0,
      platform: '23'
    }
  }
}