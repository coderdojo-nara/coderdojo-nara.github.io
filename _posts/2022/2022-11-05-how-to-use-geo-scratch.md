---
title: Stretch3（独自拡張版Scratch）で地図を使おう
date: 2022-11-05T08:30:00+09:00
author: kwaka1208
layout: post
permalink: /blog/how-to-use-geo-scratch/
categories:
  - blog
author: kwaka1208
---
こんにちは、CoderDojo 奈良の若林です。

みなさん、[Stretch3](https://stretch3.github.io/)使ってますか？

Stretch3はScratch3.0をベースに人工知能などの多くの独自拡張機能が入った超拡張版Scratchです。この記事では、Stretch3に追加された地図を表示する拡張機能「Geo Scratch」の使い方を解説しています。

## Geo Scratch
Geo Scratchは、[Geolonia](https://geolonia.com/)という会社（日本の会社です）が提供している地図サービスを使った拡張機能で、Stretch3の背景に地図を表示できます。表示した地図は拡大縮小や動かすこともできるので、地図を使った作品を作れるという今までになかった拡張機能です。

![Geo Scratch](/assets/images/2022/geo-scratch.png)

Geo Scratchの使い方そのものはそれほど難しくはないのですが、地図を表示するために必要な緯度・経度をどうやって探したらいいだろう？というところでつまづくかもしれません。緯度・経度を調べる2つの方法を案内します。

## 緯度・経度情報の見つけ方

### 1. Community Geocoderを使う
[Community Geocoder](https://community-geocoder.geolonia.com/)とは、[Geolonia社](https://geolonia.com/)が提供する緯度経度を調べるためのツールです。

[Community Geocoder](https://community-geocoder.geolonia.com/)にアクセスして、調べたい場所の住所を入力するか、地図を移動したり拡大縮小したりして目的の場所に移動します。画面の真ん中に表示された十字の位置の緯度経度がその下の欄に表示されます。

同じく、奈良の東大寺大仏殿を表示してみました。

![Community Geocoder](/assets/images/2022/community-geocoder.png)

この画面で表示された情報によると、東大寺大仏殿の緯度は34.689173度、経度は135.839886度であることがわかります。

### 2. Open StreetMapを使う
[Open StreetMap](https://www.openstreetmap.org/)とは、有志で作成された誰でも使うことができる地図サービスです。Geo Scratchを開発した[Geolonia](https://geolonia.com/)の地図でもOpen StreetMapを活用しています。

[Open StreetMap](https://www.openstreetmap.org/)にアクセスして、地図を移動したり拡大縮小したりして目的の場所に移動します。

目的の場所が見つかったら、調べたい場所で右クリックして表示されたメニューから「アドレスを表示」を選びます。すると以下の表示になります。

同じく、奈良の東大寺大仏殿を表示してみました。

![Open StreetMap](/assets/images/2022/OpenStreetMap.png)

左に表示されている数字が緯度経度です。
この画面で表示された情報によると、東大寺大仏殿の緯度は34.68904度、経度は135.83991度であることがわかります。

### 3. 緯度経度地図を使う
任意の場所の緯度経度を調べられる[緯度経度地図](https://fukuno.jig.jp/app/map/latlng/)というのがあります。

[緯度経度地図](https://fukuno.jig.jp/app/map/latlng/)にアクセスして、地図を移動したり拡大縮小したりして目的の場所に移動します。画面の真ん中に表示された十字の位置の緯度経度がその下の欄に表示されます。

同じく、奈良の東大寺大仏殿を表示してみました。

![緯度経度地図](/assets/images/2022/lat-lon-map.png)

この画面で表示された情報によると、東大寺大仏殿の緯度は34.689006度、経度は135.839873度であることがわかります。

## なぜ数字が違う？
ここで紹介した方法では、同じ東大寺大仏殿なのに違う緯度経度が見つかりました。これは、東大寺大仏殿のどこを基準にするかが異なっているためです。

## 地図を表示してみよう
緯度経度がわかったので、これを使って地図を表示してみます。

[Stretch3](https://stretch3.github.io/)にアクセスして、左下のボタンから拡張機能の一覧を表示、少し下にスクロールするとGeo Scratchが見つかるのでこれをクリックします。

Geo Scratchのブロックから以下のブロックを取り出して、経度、緯度、拡大の数字を入れます。

![地図を表示するブロック](/assets/images/2022/geo-scratch-block.png)

拡大の数字は大きくすると表示される範囲が狭くなり、小さくすると広くなります。たとえば、日本地図を表示したければ、拡大の数字を小さくすればOKです。

このブロックをクリックすると以下のような表示になりました。

![地図を表示するブロック](/assets/images/2022/daibutsuden.png)

背景（正確には透過処理された前景かもしれません）に地図が表示されました。

## Geo Scratchを使ってみよう
ここまでで、表示したい場所の地図を表示できたと思います。Geo Scratchでは、この地図を動かしたり場所の名前を表示させる機能があります。使い方は難しくなく、Scratchでのプログラミングに慣れた方ならすぐに使えるようになると思うので、色々試してみてくださいね。