import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router-dom'
import Toast from './Toast'
import Hls from 'hls.js'
import BarrageList from './BarrageList'
import BarrageInput from './BarrageInput'
import { VISITOR_ROOM_ERROR_STATUS, VISITOR_ROOM_ERROR_MESSAGE } from '../consts'

const videoSrc = require('../containers/3.mp4')
const CLIENT_WIDTH = document.documentElement.clientWidth
const CLIENT_HEIGHT = document.documentElement.clientHeight
const { NOT_FOUND } = VISITOR_ROOM_ERROR_STATUS

const styles = {
  room: {
    width: `${CLIENT_WIDTH}px`,
    height: `${CLIENT_HEIGHT}px`
  },
  roomError: {
    width: `${CLIENT_WIDTH}px`,
    height: `${CLIENT_HEIGHT}px`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column'
  },
  video: {
    objectFit: 'cover',
    width: '100%',
    height: '100%'
  },
  controlPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    color: '#fff',
    transition: 'visibility .5s'
  },
  backBtn: {
    display: 'inline-block',
    width: '24px',
    height: '24px',
    backgroundSize: '100% auto',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    backgroundImage: `url(${require('./images/over@2x.png')})`,
    position: 'absolute',
    top: '15px',
    left: '15px',
    cursor: 'pointer'
  },
  toggleCameraBtn: {
    display: 'inline-block',
    width: '31px',
    height: '26px',
    backgroundSize: '100% auto',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    backgroundImage: `url(${require('./images/toggle-camera@2x.png')})`,
    position: 'absolute',
    top: '15px',
    right: '15px',
    cursor: 'pointer'
  }
}

const RoomError = ({ status, goBack }) => {
  return (
    <div style={styles.roomError}>
      <div>{VISITOR_ROOM_ERROR_MESSAGE[status]}</div>
      <Link style={{ marginTop: '100px' }} to="/" >返回</Link>
    </div>
  )
}

export default class VisitorRoom extends Component {

  static STATUS = {
    CONNECTING: 0,
    LIVING: 1,
    NOT_FOUND: -1,
    LIVE_OVER: -2,
  }

  constructor(props) {
    super(props)
    this.state = {
      controlPanelVisible: true
    }
  }

  componentDidMount() {
    const { playUrl } = this.props
    this.hideTimer = setTimeout(()=>{
      this.setState({ controlPanelVisible: true })
    }, 3000)
    let video = this.video = ReactDOM.findDOMNode(this.refs.video)
    playUrl && this.loadSource(playUrl)
    this.showToast('努力连接中...', 99999)
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.playUrl !== this.props.playUrl) {
      this.loadSource(nextProps.playUrl)
    }
  }

  loadSource(playUrl) {
    if (!playUrl) return
    let video = this.video || ReactDOM.findDOMNode(this.refs.video)
    var hls = new Hls()
    hls.loadSource(playUrl)
    hls.attachMedia(video)
    hls.on(Hls.Events.MANIFEST_PARSED,function() {
      video.play()
    })
    hls.on(Hls.Events.ERROR, (e, err)=>{
      if (err.type === 'networkError') {
        this.showToast('解析地址出错')
      }
      console.debug(e, err)
    })
    this.showToast('连接成功', 2000)
  }

  handleTouch = () => {
    this.hideTimer && clearTimeout(this.hideTimer)
    this.setState({
      controlPanelVisible: true
    }, ()=>{
      this.hideTimer = setTimeout(()=>{
        this.setState({ controlPanelVisible: true })
      }, 3000)
    })

  }

  componentWillUnmount() {
    this.unmounted = true
    clearTimeout(this.hideTimer)
  }

  showToast = (message, duration) => {
    this.refs.toast && this.refs.toast.show(message, duration)
  }

  renderError({ status }) {
    if(status === NOT_FOUND) {
      return (
        <div style={styles.roomError}>
          您要找的房间好像不存在哦
        </div>
      )
    }
  }

  render() {
    const { handleTouch, renderError } = this
    const { controlPanelVisible } = this.state
    const { user, onExitRoom, stream,  showToast, roomStatus, roomError } = this.props

    if (roomError) return <RoomError {...roomError} goBack={onExitRoom} />

    return (
      <div style={styles.room} onClick={handleTouch}>
        <video src={videoSrc} autoPlay style={styles.video} ref="video"></video>
        <div style={{ ...styles.controlPanel, visibility: controlPanelVisible ? 'visible' : 'hidden' }}>
          <Link to="/" style={styles.backBtn}/>
        </div>
        <Toast duration={2000} ref="toast" />
        <BarrageList user={this.props.match.params}/>
        <BarrageInput user={this.props.match.params}/>
      </div>
    )
  }
}