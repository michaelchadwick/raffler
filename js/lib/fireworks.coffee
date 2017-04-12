# http://codepen.io/turusuke/pen/IEszc

canvas = document.getElementById("canvas")
context = canvas.getContext("2d")
canvas.width  = window.innerWidth
canvas.height = window.innerHeight
stage = new createjs.Stage(canvas)
stage.autoClear = false
ctx = canvas.getContext("2d")
ctx.fillStyle = "rgba(0, 0, 0, 0)"
ctx.fillRect 0,0,canvas.width,canvas.height
createjs.Ticker.setFPS(50)
# createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED
createjs.Touch.enable(stage)
stage.update()

# 重力
GRAVITY = 1

# 抵抗
K = 0.9

# スピード
SPEED = 12

# 角度(degree)からラジアン(radian)に変換
ToRadian = (degree) ->
  degree * Math.PI / 180.0

# 花火を作り上げるクラス
class Fireworks
  constructor: (@sx = 100,@sy = 100,@particles = 70) ->
    @sky = new createjs.Container()
    @r = 0
    @h = Math.random() * 360 | 0
    @s = 100
    @l = 50
    @size = 3

    for i in [0...@particles]
      speed = Math.random() * 12 + 2
      circle = new createjs.Shape()
      circle.graphics.f("hsla(#{@h}, #{@s}%, #{@l}%, 1)").dc(0, 0, @size)
      circle.snapToPixel = true
      circle.compositeOperation = "lighter"
      rad = ToRadian(Math.random() * 360 | 0)

      circle.set({
        x: @sx
        y: @sy
        vx: Math.cos(rad) * speed
        vy: Math.sin(rad) * speed
        rad: rad
      })

      @sky.addChild circle

    stage.addChild @sky

  explode: ->
    if @sky
      ++@h
      for p in [0...@sky.getNumChildren()]
        circle = @sky.getChildAt(p)

        # 加速度
        circle.vx = circle.vx * K
        circle.vy = circle.vy * K

        # 位置計算
        circle.x += circle.vx
        circle.y += circle.vy + GRAVITY

        # 色
        @l = Math.random() * 100
        # パーティクルのサイズ
        @size = @size - 0.001
        if @size > 0
          circle.graphics.c().f("hsla(#{@h}, 100%, #{@l}%, 1)").dc(0, 0, @size)

      if @sky.alpha > 0.1
        @sky.alpha -= K / 50
      else
        stage.removeChild @sky
        @sky = null

    else

    return

fireBoss = []

setInterval(->
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
  ctx.fillRect 0,0,canvas.width,canvas.height
  return
,40)

setInterval(->
  x = Math.random() * canvas.width | 0
  y = Math.random() * canvas.height | 0
  fireBoss.push new Fireworks(x,y)
  fireBoss.push new Fireworks(x,y)
,1300)

repeat = ->
  for fireworks in [0...fireBoss.length]
    if fireBoss[fireworks].sky
      fireBoss[fireworks].explode()

  stage.update()

  return

createjs.Ticker.on("tick", repeat)

stage.addEventListener "stagemousedown", ->
  fireBoss.push new Fireworks(stage.mouseX,stage.mouseY)
  fireBoss.push new Fireworks(stage.mouseX,stage.mouseY)
