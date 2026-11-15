export const languages = { en: 'English', zh: '中文', ja: '日本語' };

const en = {
  demoTime: 'Friday · 16:30', myRooms: 'My rooms', explore: 'Explore', soon: 'Soon', language: 'Language',
  location: 'Kyoto University · Yoshida', hero: 'Your next hangout.',
  create: 'Create a room', join: 'Join with code', monsterSpeech: 'So… what’s the plan?',
  yourRooms: 'Your rooms', demo: 'Try the demo', latest: 'Your latest room',
  demoTitle: 'Friday after class', demoDescription: 'Meet the sample group and try planning together.',
  latestDescription: 'Your next get-together is waiting.', openRoom: 'Open room',
  startSomething: 'Start something.', roomDescription: 'A room for your kind of people.',
  aroundCampus: 'Around campus', examplePrices: 'Neighborhood ideas with estimated budgets. Check actual prices and availability.',
  river: 'Kamogawa walk', ramen: 'Ramen stop', cafe: 'Coffee break',
  riverDescription: 'Catch up by the river near Demachiyanagi.',
  ramenDescription: 'Find a ramen spot around Hyakumanben.',
  cafeDescription: 'Coffee and conversation near campus.',
  Demachiyanagi: 'Demachiyanagi', Hyakumanben: 'Hyakumanben', 'Yoshida area': 'Yoshida area',
  'Yoshida Campus': 'Yoshida Campus', 'Decide together': 'Decide together',
  free: 'Free', estimated: 'Estimated', perPerson: 'per person', maps: 'Open in Maps',
  newRoom: 'New room', nameRoom: 'Give your hangout a name', when: 'When?', optional: 'Optional',
  kyotoTime: 'Kyoto time', where: 'Where to meet?', creating: 'Creating…',
  roomCode: 'Room code', joinTitle: 'Find your people.', joining: 'Joining…',
  enterCode: 'Eight-character room code', close: 'Close', back: 'My rooms', copyInvite: 'Copy invite link',
  demoBanner: 'Sample room. Changes stay in this preview.', createReal: 'Create a real room',
  groupTab: 'The group', planTab: 'The plan', yourPicks: 'Your preferences', saved: 'Saved', yourTurn: 'Your turn',
  name: 'Your name', namePlaceholder: 'What do your friends call you?', avatar: 'Choose your avatar',
  mood: 'What are you in the mood for?', Ramen: 'Ramen', Coffee: 'Coffee', Outdoors: 'Outdoors',
  'Japanese food': 'Japanese food', Games: 'Games', 'Something sweet': 'Something sweet',
  budget: 'Your budget', notes: 'Anything to keep in mind?', notesPlaceholder: 'Dietary needs, accessibility, other notes',
  notesHint: 'Notes are visible to the room. Review them together before confirming.',
  save: 'Save my preferences', update: 'Update my preferences', saving: 'Saving…',
  gang: 'The group', emptyGroup: 'First one here! Save your preferences, then invite friends.',
  readyRoll: 'Everybody in?', rollDescription: 'Find a plan that fits the group.', roll: 'Roll the plan',
  rulesPreview: 'Preference-based recommendations', plans: 'Your possible plans', confirmedTitle: 'It’s a plan!',
  plansHint: 'Ranked by saved preferences, within the lowest budget in the group. Check opening hours and dietary needs together.',
  lucky: 'Feeling lucky', rolling: 'Finding your common ground…', bestMatch: 'Best match', anotherWay: 'Another way',
  confirmed: 'Confirmed', luckyPick: 'Lucky pick', choose: 'Choose this plan', seeYou: 'See you there!',
  budgetFit: 'Within everyone’s saved budget', noPlans: 'Good plans start with your preferences.',
  addPicks: 'Add preferences', rulesHint: 'AI integration is planned. Current plans use preference and budget rules.',
  riverTitle: 'Riverside & a little detour', riverReason: 'A flexible outdoor plan with room to chat.',
  ramenTitle: 'Noodles, then a stroll', ramenReason: 'A meal around Hyakumanben, followed by a riverside walk.',
  cafeTitle: 'Coffee & campus catch-up', cafeReason: 'A simple café meetup with time to talk.',
  profileTitle: 'Your profile', profileHint: 'Your name and avatar are remembered on this device.', saveProfile: 'Save profile',
  exploreTitle: 'Meet around campus.', exploreHint: 'Public events, a campus map and new friends are planned for version 2.',
  forNow: 'Plan with friends',
  attendanceTitle: 'If you go, I’ll go', attendanceHint: 'Choose how you feel about joining. Your chosen person stays private.',
  attendance: 'Joining status', maybe: 'Maybe', going: 'I’m in', conditional: 'If you go, I’ll go',
  followWho: 'Who are you waiting for?', choosePerson: 'Choose a person', noPeople: 'Invite a friend first to use this option.',
  waiting: 'Waiting for {name}', conditionReady: '{name} is in. Ready to join?', confirmAttendance: 'Yes, I’m in',
  mutualWait: 'You are waiting on each other. One of you can choose “I’m in” to start.',
  dependencyChanged: 'Your friend changed their status. Please choose again when you’re ready.',
  tally: '{going} going · {maybe} maybe · {conditional} conditional', statusSaved: 'Joining status saved.',
  picksSaved: 'Your preferences are saved!', plansReady: 'Your plans are ready!', luckyReady: 'A little luck picked this one!',
  planConfirmed: 'Plan confirmed. See you there!', inviteCopied: 'Invite link copied!', shareCode: 'Share this room code: {code}',
  profileSaved: 'Profile saved on this device.', needName: 'Add your name first.', needPicks: 'Save at least one person’s preferences first.',
  saveFirst: 'Save your preferences before choosing a plan.', errorGeneric: 'Something went wrong. Please try again.',
  roomMissing: 'Room not found. Check the code.', invalidCode: 'Enter an eight-character room code.', invalidName: 'Give your hangout a name.',
  invalidBudget: 'Choose a budget between ¥0 and ¥5,000.', invalidPerson: 'Choose another person in this room.',
  roomFull: 'This room is full (20 people).', conflict: 'A friend just updated this room. Please try again.',
  planChanged: 'This plan no longer fits the group. Refresh your plans.', notReady: 'Your chosen person has not confirmed yet.',
  footer: 'Made for getting together.', offline: 'Offline preview. Rooms are saved on this device only.',
};
const zh = {
  demoTime:'周五 · 16:30', myRooms:'我的房间', explore:'发现', soon:'即将开放', language:'语言', location:'京都大学 · 吉田校区', hero:'下次聚会，去哪儿？',
  create:'创建房间', join:'输入房间码加入', monsterSpeech:'所以…这次去哪儿？', yourRooms:'你的房间', demo:'体验示例', latest:'最近的房间',
  demoTitle:'下课后一起玩', demoDescription:'加入示例小组，试试一起安排聚会。', latestDescription:'下一次聚会在等你。', openRoom:'进入房间',
  startSomething:'约起来吧。', roomDescription:'给想一起玩的人建个房间。', aroundCampus:'校园周边',
  examplePrices:'周边活动灵感与参考预算，请确认实际价格和营业情况。', river:'鸭川散步', ramen:'一起吃拉面', cafe:'喝杯咖啡',
  riverDescription:'在出町柳附近的河边散步聊天。', ramenDescription:'在百万遍附近找一家拉面店。', cafeDescription:'在校园附近喝咖啡，慢慢聊天。',
  Demachiyanagi:'出町柳', Hyakumanben:'百万遍', 'Yoshida area':'吉田周边', 'Yoshida Campus':'吉田校区', 'Decide together':'一起决定',
  free:'免费', estimated:'预计', perPerson:'每人', maps:'在地图中查看', newRoom:'新房间', nameRoom:'给聚会起个名字', when:'什么时候？', optional:'选填',
  kyotoTime:'京都时间', where:'在哪里集合？', creating:'正在创建…', roomCode:'房间码', joinTitle:'找到你的朋友。', joining:'正在加入…',
  enterCode:'8 位房间码', close:'关闭', back:'我的房间', copyInvite:'复制邀请链接', demoBanner:'示例房间，修改仅保留在本次预览中。', createReal:'创建真实房间',
  groupTab:'聚会成员', planTab:'聚会方案', yourPicks:'你的偏好', saved:'已保存', yourTurn:'轮到你啦', name:'你的名字', namePlaceholder:'朋友们怎么称呼你？', avatar:'选择你的头像',
  mood:'这次想做什么？', Ramen:'拉面', Coffee:'咖啡', Outdoors:'户外', 'Japanese food':'日料', Games:'游戏', 'Something sweet':'甜点',
  budget:'你的预算', notes:'还有什么需要注意？', notesPlaceholder:'饮食要求、无障碍需求或其他备注', notesHint:'备注对房间成员可见，确认方案前请一起查看。',
  save:'保存我的偏好', update:'更新我的偏好', saving:'正在保存…', gang:'聚会成员', emptyGroup:'你是第一个！保存偏好，再邀请朋友加入。',
  readyRoll:'大家都到齐了吗？', rollDescription:'找一个适合大家的方案。', roll:'生成聚会方案', rulesPreview:'根据偏好推荐', plans:'这次可以这样玩', confirmedTitle:'就这么约定啦！',
  plansHint:'根据已保存的偏好排序，并满足所有人的最低预算。请一起确认营业时间和饮食需求。', lucky:'帮我随机选', rolling:'正在寻找共同喜好…', bestMatch:'最合适', anotherWay:'另一种选择',
  confirmed:'已确认', luckyPick:'幸运之选', choose:'选择这个方案', seeYou:'到时见！', budgetFit:'符合所有人已保存的预算', noPlans:'好方案从填写偏好开始。', addPicks:'填写偏好',
  rulesHint:'计划接入 AI。目前根据偏好和预算规则推荐。', riverTitle:'鸭川散步，顺路坐坐', riverReason:'轻松的户外安排，留足聊天时间。',
  ramenTitle:'吃碗拉面，再散散步', ramenReason:'在百万遍吃饭，然后去河边走走。', cafeTitle:'咖啡与校园闲聊', cafeReason:'简单的咖啡店聚会，有时间慢慢聊。',
  profileTitle:'你的个人资料', profileHint:'名字和头像会保存在这台设备上。', saveProfile:'保存资料', exploreTitle:'在校园周边认识新朋友。', exploreHint:'第二版计划加入公开活动、校园地图和认识朋友的功能。', forNow:'先和朋友约起来',
  attendanceTitle:'你去，我就去', attendanceHint:'表达你的参加意愿。你选择跟随的人只有自己能看到。', attendance:'参加状态', maybe:'还不确定', going:'我确定参加', conditional:'你去，我就去',
  followWho:'你在等谁参加？', choosePerson:'选择一个人', noPeople:'先邀请一位朋友加入，就可以使用这个选项。', waiting:'正在等 {name}', conditionReady:'{name} 确定参加了。你也来吗？', confirmAttendance:'好，我也参加',
  mutualWait:'你们正在互相等待，其中一人可以先选择「我确定参加」。', dependencyChanged:'你的朋友更改了参加状态，准备好后请重新选择。',
  tally:'{going} 人确定 · {maybe} 人待定 · {conditional} 人有条件参加', statusSaved:'已保存参加状态。', picksSaved:'你的偏好已保存！', plansReady:'聚会方案准备好了！', luckyReady:'这次幸运选中了它！',
  planConfirmed:'方案已确认，到时见！', inviteCopied:'邀请链接已复制！', shareCode:'把这个房间码发给朋友：{code}', profileSaved:'资料已保存在这台设备。', needName:'先填一下你的名字吧。',
  needPicks:'请至少一位成员先保存偏好。', saveFirst:'请先保存偏好，再选择方案。', errorGeneric:'操作未完成，请再试一次。', roomMissing:'找不到房间，请检查房间码。', invalidCode:'请输入 8 位房间码。', invalidName:'请给聚会起个名字。',
  invalidBudget:'请选择 0 至 5,000 日元的预算。', invalidPerson:'请选择房间内的另一位成员。', roomFull:'房间已满，最多 20 人。', conflict:'刚有朋友更新了房间，请再试一次。', planChanged:'这个方案已不符合大家的条件，请刷新方案。', notReady:'你选择的人还没确认参加。',
  footer:'让聚会真的发生。', offline:'离线预览，房间仅保存在这台设备上。',
};
const ja = {
  demoTime:'金曜日 · 16:30', myRooms:'マイルーム', explore:'見つける', soon:'近日公開', language:'言語', location:'京都大学 · 吉田キャンパス', hero:'次は、どこに集まる？',
  create:'ルームを作る', join:'コードで参加', monsterSpeech:'それで…どこ行く？', yourRooms:'あなたのルーム', demo:'デモを試す', latest:'最近のルーム',
  demoTitle:'授業のあとに集合', demoDescription:'サンプルのメンバーと予定を立ててみよう。', latestDescription:'次の集まりが待っています。', openRoom:'ルームを開く',
  startSomething:'みんなを誘おう。', roomDescription:'一緒に過ごしたい人のためのルーム。', aroundCampus:'キャンパス周辺',
  examplePrices:'周辺の過ごし方と予算の目安です。実際の料金や営業状況をご確認ください。', river:'鴨川を散歩', ramen:'ラーメンを食べる', cafe:'カフェでひと息',
  riverDescription:'出町柳近くの河原で、ゆっくりおしゃべり。', ramenDescription:'百万遍周辺でラーメンのお店を探そう。', cafeDescription:'キャンパス近くでコーヒーと会話を。',
  Demachiyanagi:'出町柳', Hyakumanben:'百万遍', 'Yoshida area':'吉田周辺', 'Yoshida Campus':'吉田キャンパス', 'Decide together':'みんなで決める',
  free:'無料', estimated:'目安', perPerson:'1人あたり', maps:'地図で見る', newRoom:'新しいルーム', nameRoom:'集まりの名前', when:'いつ？', optional:'任意',
  kyotoTime:'日本時間', where:'集合場所は？', creating:'作成中…', roomCode:'ルームコード', joinTitle:'みんなと合流しよう。', joining:'参加中…',
  enterCode:'8桁のルームコード', close:'閉じる', back:'マイルーム', copyInvite:'招待リンクをコピー', demoBanner:'デモルームです。変更はこのプレビュー内に保存されます。', createReal:'実際のルームを作る',
  groupTab:'メンバー', planTab:'プラン', yourPicks:'あなたの希望', saved:'保存済み', yourTurn:'あなたの番！', name:'あなたの名前', namePlaceholder:'みんなに呼んでほしい名前', avatar:'アバターを選ぶ',
  mood:'何をしたい？', Ramen:'ラーメン', Coffee:'コーヒー', Outdoors:'アウトドア', 'Japanese food':'和食', Games:'ゲーム', 'Something sweet':'スイーツ',
  budget:'あなたの予算', notes:'ほかに伝えたいことは？', notesPlaceholder:'食事の制限、バリアフリーの希望、その他のメモ', notesHint:'メモはルームの全員に表示されます。確定前に一緒に確認しましょう。',
  save:'希望を保存', update:'希望を更新', saving:'保存中…', gang:'メンバー', emptyGroup:'一番乗り！希望を保存して、友だちを招待しよう。',
  readyRoll:'みんな揃った？', rollDescription:'みんなに合うプランを見つけよう。', roll:'プランを作る', rulesPreview:'希望に合わせたおすすめ', plans:'こんな過ごし方はどう？', confirmedTitle:'これで決まり！',
  plansHint:'保存された希望で順位をつけ、全員の予算内に収めています。営業時間や食事の制限を一緒に確認してください。', lucky:'おまかせで選ぶ', rolling:'みんなの共通点を探しています…', bestMatch:'おすすめ', anotherWay:'別のアイデア',
  confirmed:'確定', luckyPick:'ラッキーチョイス', choose:'このプランにする', seeYou:'当日会おう！', budgetFit:'全員の保存済み予算内', noPlans:'まずは希望を教えてください。', addPicks:'希望を入力',
  rulesHint:'AI連携を予定しています。現在は希望と予算のルールで提案します。', riverTitle:'鴨川さんぽと寄り道', riverReason:'おしゃべりの時間をたっぷり取れる、気軽な屋外プラン。',
  ramenTitle:'ラーメンのあとに散歩', ramenReason:'百万遍で食事をしてから、河原へ。', cafeTitle:'カフェでゆっくり近況報告', cafeReason:'予定を詰め込まず、コーヒーを飲みながら会話を。',
  profileTitle:'プロフィール', profileHint:'名前とアバターはこの端末に保存されます。', saveProfile:'プロフィールを保存', exploreTitle:'キャンパス周辺でつながろう。', exploreHint:'バージョン2では公開イベント、周辺マップ、新しい出会いを予定しています。', forNow:'友だちと予定を立てる',
  attendanceTitle:'あなたが行くなら、私も', attendanceHint:'参加の気持ちを選んでください。選んだ相手は自分だけに表示されます。', attendance:'参加状況', maybe:'まだ未定', going:'参加する', conditional:'あなたが行くなら、私も',
  followWho:'誰の参加を待っていますか？', choosePerson:'相手を選ぶ', noPeople:'まず友だちを招待すると、この選択肢が使えます。', waiting:'{name} の参加待ち', conditionReady:'{name} が参加します。あなたも参加しますか？', confirmAttendance:'私も参加する',
  mutualWait:'お互いの参加を待っています。どちらかが先に「参加する」を選べます。', dependencyChanged:'友だちが参加状況を変更しました。準備ができたら、もう一度選んでください。',
  tally:'参加 {going} 人 · 未定 {maybe} 人 · 条件付き {conditional} 人', statusSaved:'参加状況を保存しました。', picksSaved:'希望を保存しました！', plansReady:'プランができました！', luckyReady:'今回はこれに決まり！',
  planConfirmed:'プランを確定しました。当日会おう！', inviteCopied:'招待リンクをコピーしました！', shareCode:'このコードを友だちに送ってください：{code}', profileSaved:'この端末に保存しました。', needName:'まず名前を入力してください。',
  needPicks:'少なくとも1人が希望を保存してください。', saveFirst:'プランを選ぶ前に希望を保存してください。', errorGeneric:'処理できませんでした。もう一度お試しください。', roomMissing:'ルームが見つかりません。コードを確認してください。', invalidCode:'8桁のコードを入力してください。', invalidName:'集まりの名前を入力してください。',
  invalidBudget:'0〜5,000円の予算を選んでください。', invalidPerson:'ルーム内のほかのメンバーを選んでください。', roomFull:'ルームは満員です（最大20人）。', conflict:'友だちがルームを更新しました。もう一度お試しください。', planChanged:'このプランは現在の条件に合いません。更新してください。', notReady:'選んだ相手はまだ参加を確定していません。',
  footer:'みんなで集まる、そのために。', offline:'オフラインプレビュー。ルームはこの端末だけに保存されます。',
};

const additions = {
  "Card games": [
    "Card games",
    "卡牌游戏",
    "カードゲーム"
  ],
  "Board games": [
    "Board games",
    "桌游",
    "ボードゲーム"
  ],
  "Cooking together": [
    "Cooking together",
    "一起做饭",
    "一緒に料理"
  ],
  "Potluck": [
    "Potluck / food sharing",
    "带食物分享",
    "持ち寄りごはん"
  ],
  "Drinks": [
    "Drinks",
    "喝一杯",
    "飲み会"
  ],
  "Hiking": [
    "Hiking",
    "爬山",
    "ハイキング"
  ],
  "Picnic": [
    "Picnic",
    "野餐",
    "ピクニック"
  ],
  "Hot pot": [
    "Hot pot",
    "火锅",
    "鍋"
  ],
  "BBQ": [
    "BBQ",
    "烧烤",
    "バーベキュー"
  ],
  "Karaoke": [
    "Karaoke",
    "卡拉 OK",
    "カラオケ"
  ],
  "Movies": [
    "Movies",
    "看电影",
    "映画"
  ],
  "Video games": [
    "Video games",
    "电子游戏",
    "ビデオゲーム"
  ],
  "Badminton": [
    "Badminton",
    "羽毛球",
    "バドミントン"
  ],
  "Basketball": [
    "Basketball",
    "篮球",
    "バスケットボール"
  ],
  "Cycling": [
    "Cycling",
    "骑行",
    "サイクリング"
  ],
  "Photography": [
    "Photography",
    "摄影",
    "写真散歩"
  ],
  "Museum": [
    "Museum",
    "逛展",
    "美術館"
  ],
  "Shopping": [
    "Shopping",
    "逛街",
    "買い物"
  ],
  "Study together": [
    "Study together",
    "一起学习",
    "勉強会"
  ],
  "customActivity": [
    "Add your own activity",
    "添加自定义项目",
    "やりたいことを追加"
  ],
  "activityPlaceholder": [
    "e.g. Werewolf, baking, a birthday dinner",
    "例如狼人杀、烘焙、生日聚餐",
    "例：人狼、パン作り、誕生日会"
  ],
  "addActivity": [
    "Add",
    "添加",
    "追加"
  ],
  "removeActivity": [
    "Remove activity",
    "移除项目",
    "項目を削除"
  ],
  "pickLimit": [
    "Choose up to 12 activities.",
    "最多选择 12 个项目。",
    "12個まで選べます。"
  ],
  "groupSize": [
    "Expected group size",
    "预计人数",
    "予定人数"
  ],
  "people": [
    "{count} people",
    "{count} 人",
    "{count}人"
  ],
  "showEveryone": [
    "Show all {count} people",
    "查看全部 {count} 人",
    "全員（{count}人）を見る"
  ],
  "showLess": [
    "Show fewer",
    "收起",
    "折りたたむ"
  ],
  "quickTools": [
    "Little decisions",
    "聚会小工具",
    "ちょっとした決めごと"
  ],
  "lunchTool": [
    "What’s for lunch?",
    "今天中午吃什么？",
    "今日のお昼、何にする？"
  ],
  "lunchHint": [
    "Make a lunch vote and send the link.",
    "发起午饭投票，把链接发给大家。",
    "お昼の候補を投票で決めよう。"
  ],
  "voteTool": [
    "Settle it with a vote",
    "来投个票",
    "みんなで投票"
  ],
  "voteHint": [
    "Pick the food, game, day or next stop.",
    "选吃什么、玩什么、哪天或下一站。",
    "ごはん、ゲーム、日程、次の行き先。"
  ],
  "routeTool": [
    "Put the stops in order",
    "把路线排好",
    "行き先を順番に"
  ],
  "routeHint": [
    "Add real place names and open the whole route.",
    "填写具体店名，一键打开整条路线。",
    "具体的な店名を入れて、ルートを開こう。"
  ],
  "pollQuestion": [
    "Your question",
    "投票问题",
    "投票の質問"
  ],
  "pollOptions": [
    "The options",
    "投票选项",
    "選択肢"
  ],
  "pollOptionsHint": [
    "2–12 options. Use exact shop names if you have them.",
    "填写 2–12 个选项，也可以直接填具体店名。",
    "2〜12個。具体的な店名でもOK。"
  ],
  "createVote": [
    "Create a shared vote",
    "发起共享投票",
    "投票を作る"
  ],
  "votesTab": [
    "Votes",
    "投票",
    "投票"
  ],
  "voteCount": [
    "{count} votes",
    "{count} 票",
    "{count}票"
  ],
  "totalVotes": [
    "{count} people voted · you can change your vote",
    "{count} 人已投票，可修改自己的选择",
    "{count}人が投票済み・変更できます"
  ],
  "voteName": [
    "Your name to vote",
    "投票时显示的名字",
    "投票する名前"
  ],
  "voteSaved": [
    "Your vote is saved.",
    "投票已保存。",
    "投票しました。"
  ],
  "noPolls": [
    "Create a vote for this group.",
    "为这个房间发起投票。",
    "このグループで投票を作ろう。"
  ],
  "invalidPoll": [
    "Add a question and 2–12 different options.",
    "请填写问题和 2–12 个不同选项。",
    "質問と異なる選択肢を2〜12個入力してください。"
  ],
  "pollLimit": [
    "This room already has 10 votes.",
    "每个房间最多 10 个投票。",
    "1ルーム10件までです。"
  ],
  "routesTab": [
    "Route",
    "路线",
    "ルート"
  ],
  "routeOrigin": [
    "Meeting point / starting place",
    "集合地点／起点",
    "集合場所・出発地"
  ],
  "routeStops": [
    "Exact places, in order (one per line)",
    "按顺序填写具体地点，每行一个",
    "行き先を順番に1行ずつ"
  ],
  "routeExample": [
    "Use full names and “Kyoto”, or paste a street address.",
    "填写完整店名并加上京都，或直接填写地址。",
    "正式な店名と「京都」、または住所を入力。"
  ],
  "routeMode": [
    "How are you getting there?",
    "怎么过去？",
    "移動方法"
  ],
  "walking": [
    "Walk",
    "步行",
    "徒歩"
  ],
  "bicycling": [
    "Cycle",
    "骑行",
    "自転車"
  ],
  "transit": [
    "Public transport",
    "公共交通",
    "公共交通"
  ],
  "driving": [
    "Drive",
    "驾车",
    "車"
  ],
  "openRoute": [
    "Open the full route in Google Maps",
    "在 Google Maps 打开整条路线",
    "Google マップでルートを開く"
  ],
  "saveRoute": [
    "Save route for the group",
    "保存给房间成员",
    "ルートを共有保存"
  ],
  "routeSaved": [
    "The route is saved for everyone.",
    "路线已为所有成员保存。",
    "全員にルートを保存しました。"
  ],
  "invalidRoute": [
    "Add a starting point and 1–4 exact places.",
    "请填写起点和 1–4 个具体地点。",
    "出発地と具体的な行き先を1〜4件入力。"
  ],
  "transitStops": [
    "For public transport, choose one destination at a time.",
    "公共交通请每次选择一个终点。",
    "公共交通は目的地を1つずつ指定してください。"
  ],
  "routeHonesty": [
    "Google Maps resolves the places and calculates travel times when you open it. Automatic venue search is the next integration.",
    "打开后由 Google Maps 识别地点并计算交通时间。自动搜索具体店铺是下一步接入功能。",
    "開くと Google マップが場所と所要時間を確認します。お店の自動検索は次の連携機能です。"
  ],
  "privatePlace": [
    "For home gatherings, share private addresses only with people you trust.",
    "在家聚会时，请只向可信任的成员分享私人地址。",
    "自宅の住所は信頼できるメンバーにだけ共有しましょう。"
  ],
  "routePlaceholder": [
    "Full shop name, Kyoto\nNext place, Kyoto",
    "具体店名，京都\n下一站地点，京都",
    "正式な店名、京都\n次の行き先、京都"
  ],
  "routeUpdatedBy": [
    "Updated by {name}",
    "由 {name} 更新",
    "{name}が更新"
  ],
  "cardsTitle": [
    "A proper game night",
    "卡牌桌游之夜",
    "カード・ボードゲーム会"
  ],
  "cardsReason": [
    "Bring your decks and choose a host or a suitable game space together.",
    "带上卡牌，一起确定谁来招待或合适的桌游场地。",
    "カードを持ち寄って、会場やホストを決めよう。"
  ],
  "cookingTitle": [
    "Cook something together",
    "一起做一顿饭",
    "みんなで料理"
  ],
  "cookingReason": [
    "Vote on the menu, choose a kitchen, then add a supermarket stop to the route.",
    "先投票决定菜单、确认厨房，再把超市加入路线。",
    "献立を投票で決め、キッチンと買い出し先を選ぼう。"
  ],
  "potluckTitle": [
    "Everyone brings a little",
    "每人带一道",
    "持ち寄りごはん"
  ],
  "potluckReason": [
    "Vote on what to bring and agree on a host or picnic spot.",
    "投票分配食物，再确定招待者或野餐地点。",
    "持ち寄るものを決めて、会場やピクニック場所を相談。"
  ],
  "picnicTitle": [
    "Food, friends and a picnic",
    "带上食物去野餐",
    "みんなでピクニック"
  ],
  "picnicReason": [
    "Choose a grocery stop and a picnic location, then save the route.",
    "选择采购店和野餐地，再保存整条路线。",
    "買い出し先と場所を選んで、ルートを保存。"
  ],
  "hikingTitle": [
    "Take the group outside",
    "一起去爬山",
    "みんなでハイキング"
  ],
  "hikingReason": [
    "Agree on a trail and meeting point, and check conditions before heading out.",
    "确定步道和集合地点，出发前确认当天情况。",
    "コースと集合場所を決めて、当日の状況を確認。"
  ],
  "drinksTitle": [
    "A drink and a long catch-up",
    "喝一杯，慢慢聊",
    "飲みながら近況報告"
  ],
  "drinksReason": [
    "Pick a venue that can accommodate the group, then add it as an exact stop.",
    "挑选能接待大家的店，再把具体店名加入路线。",
    "人数に合うお店を選び、具体的な行き先として追加。"
  ],
  "customTitle": [
    "Your own kind of hangout",
    "你们自己的聚会方式",
    "自分たちらしい集まり"
  ],
  "customReason": [
    "Use the group’s custom activities to choose a place and build a route.",
    "根据大家的自定义项目，选好地点并排列路线。",
    "自由入力の希望から、場所とルートを決めよう。"
  ],
  "planningBudget": [
    "Suggested activity budget, not a venue quote",
    "活动参考预算，并非店铺报价",
    "活動予算の目安・店舗価格ではありません"
  ],
  "addRoute": [
    "Choose exact places and route",
    "选择具体地点和路线",
    "場所とルートを決める"
  ]
};
for (const [key, values] of Object.entries(additions)) {
  en[key] = values[0]; zh[key] = values[1]; ja[key] = values[2];
}
en.roomFull = "This room is full (50 people).";
zh.roomFull = "房间已满，最多 50 人。";
ja.roomFull = "ルームは満員です（最大50人）。";

const refinements = {
  "lunchHint": [
    "Tell us where you are and what you feel like. Get lunch ideas before the bell.",
    "输入位置和口味，在下课前决定午饭。",
    "今いる場所と気分から、授業前にランチを決めよう。"
  ],
  "lunchEyebrow": [
    "THE BEFORE-CLASS DILEMMA",
    "上课前，午饭别纠结",
    "授業前の「何食べる？」"
  ],
  "lunchTitle": [
    "Lunch, figured out.",
    "午饭，帮你想好。",
    "お昼、決めよう。"
  ],
  "lunchIntro": [
    "Your location, your break, your appetite. Find a place that fits.",
    "你在哪、空多久、想吃什么。找一家适合现在的店。",
    "場所と休み時間と食べたいもの。今に合うお店を。"
  ],
  "whereNow": [
    "Where are you starting?",
    "你现在在哪？",
    "どこから出発？"
  ],
  "customLocation": [
    "Somewhere else…",
    "自定义地点…",
    "ほかの場所…"
  ],
  "locationPlaceholder": [
    "Building, dorm, station or street address in Kyoto",
    "京都的教学楼、宿舍、车站或地址",
    "京都の建物・寮・駅・住所"
  ],
  "Shugakuin Dorm": [
    "Shugakuin dorm",
    "修学院宿舍",
    "修学院宿舎"
  ],
  "breakMinutes": [
    "Time until your next class",
    "距离下一节课还有多久",
    "次の授業までの時間"
  ],
  "minuteUnit": [
    "minutes",
    "分钟",
    "分"
  ],
  "maxWalk": [
    "Maximum walk, one way",
    "单程最多走多久",
    "片道で歩ける時間"
  ],
  "mealMinutes": [
    "Time to eat",
    "吃饭预留时间",
    "食事に使う時間"
  ],
  "lunchBudget": [
    "Budget per person",
    "每人预算",
    "1人の予算"
  ],
  "lunchPeople": [
    "How many people?",
    "几个人一起？",
    "何人で行く？"
  ],
  "cuisineLabel": [
    "What sounds good?",
    "想吃什么类型？",
    "どんな気分？"
  ],
  "cuisineAny": [
    "Surprise me",
    "帮我决定",
    "おまかせ"
  ],
  "cuisineRamen": [
    "Ramen",
    "拉面",
    "ラーメン"
  ],
  "cuisineCurry": [
    "Curry",
    "咖喱",
    "カレー"
  ],
  "cuisineUdon": [
    "Udon",
    "乌冬",
    "うどん"
  ],
  "cuisineSoba": [
    "Soba",
    "荞麦面",
    "そば"
  ],
  "cuisineJapanese": [
    "Japanese",
    "日料／定食",
    "和食・定食"
  ],
  "cuisineChinese": [
    "Chinese",
    "中餐",
    "中華"
  ],
  "cuisineWestern": [
    "Western",
    "西餐",
    "洋食"
  ],
  "cuisineCafe": [
    "Café lunch",
    "咖啡店简餐",
    "カフェランチ"
  ],
  "lunchPreferences": [
    "Anything more specific?",
    "再具体一点？",
    "もう少し詳しく"
  ],
  "lunchPreferencesPlaceholder": [
    "e.g. curry rice, a filling set meal, takeaway",
    "例如咖喱饭、量大的定食、可以打包",
    "例：カレー、ボリュームのある定食、テイクアウト"
  ],
  "vegetarianOnly": [
    "Vegetarian options needed",
    "需要素食选项",
    "ベジタリアンの選択肢が必要"
  ],
  "returnToClass": [
    "Get me back to the starting point",
    "还要返回出发地点上课",
    "出発地に戻る時間も含める"
  ],
  "findLunch": [
    "Find my lunch",
    "帮我决定午饭",
    "ランチを探す"
  ],
  "findingLunch": [
    "Checking places and walking routes…",
    "正在查店铺和步行路线…",
    "お店と徒歩ルートを確認中…"
  ],
  "lunchSummaryTitle": [
    "Your lunch brief",
    "这次午饭的条件",
    "今回のランチ条件"
  ],
  "lunchSummary": [
    "{people} people · up to ¥{budget} each · {minutes} minutes",
    "{people} 人 · 每人 ¥{budget} 以内 · {minutes} 分钟",
    "{people}人・1人¥{budget}以内・{minutes}分"
  ],
  "returnIncluded": [
    "Return walk included",
    "包含回程时间",
    "帰りの徒歩時間込み"
  ],
  "lunchReady": [
    "Here’s where you could go",
    "这几家可以考虑",
    "こんなお店はどう？"
  ],
  "walkTime": [
    "{count} min walk, one way",
    "单程步行 {count} 分钟",
    "片道徒歩{count}分"
  ],
  "wholeLunchTime": [
    "About {count} min including your meal",
    "加上吃饭约 {count} 分钟",
    "食事を含め約{count}分"
  ],
  "budgetConfirmed": [
    "Listed price range fits your budget",
    "已列价格范围符合预算",
    "掲載価格帯は予算内"
  ],
  "budgetUnknown": [
    "Menu prices need checking",
    "菜单价格待确认",
    "メニュー価格の確認が必要"
  ],
  "openNow": [
    "Listed as open now",
    "地图显示目前营业",
    "現在営業中の表示"
  ],
  "hoursUnknown": [
    "Opening hours need checking",
    "营业时间待确认",
    "営業時間は要確認"
  ],
  "groupCheck": [
    "Ask the venue about seating for your group. Waiting time is not included.",
    "多人同行请先确认座位，计算时间未包含排队。",
    "グループの席はお店に確認。待ち時間は含みません。"
  ],
  "dietCheck": [
    "Confirm dietary needs directly with the venue.",
    "饮食要求请直接向店铺确认。",
    "食事の制限はお店に直接ご確認ください。"
  ],
  "goEat": [
    "Take me there",
    "就去这里，查看路线",
    "ここへ行く・ルートを見る"
  ],
  "newLunchSearch": [
    "Change my choices",
    "调整条件",
    "条件を変える"
  ],
  "noLunchMatch": [
    "No verified routes fit these conditions. Try more time or a longer walk.",
    "没有找到符合这些时间条件的路线，可增加用餐时间或步行范围。",
    "条件に合うルートが見つかりません。時間や徒歩範囲を広げてみてください。"
  ],
  "mapsNotConfigured": [
    "In-app place search is not enabled yet. Your choices are ready to search in Google Maps.",
    "站内搜店还未启用。已为你组合好条件，可以先在 Google Maps 查看真实店铺。",
    "アプリ内のお店検索は準備中。入力条件で Google マップを検索できます。"
  ],
  "searchOnMaps": [
    "Find matching places on Google Maps",
    "在 Google Maps 查符合条件的店",
    "Google マップで条件に合うお店を探す"
  ],
  "mapsServiceError": [
    "The map service could not complete this search. Please try again.",
    "地图服务暂时没能完成搜索，请稍后重试。",
    "地図サービスで検索できませんでした。もう一度お試しください。"
  ],
  "mapsRouteError": [
    "Places were found, but walking routes could not be checked. Please try again.",
    "已找到店铺，但步行路线暂时未能核实，请重试。",
    "お店は見つかりましたが、徒歩ルートを確認できませんでした。"
  ],
  "mapsQuota": [
    "Today’s in-app map search allowance has been reached. You can still open Google Maps.",
    "今天的站内地图搜索额度已用完，仍可打开 Google Maps 搜索。",
    "本日のアプリ内検索上限に達しました。Google マップで検索できます。"
  ],
  "locationNotFound": [
    "We couldn’t identify that starting point. Try a full name or address.",
    "未能识别这个起点，请填写完整名称或地址。",
    "出発地が見つかりません。正式名称や住所をお試しください。"
  ],
  "locationRequired": [
    "Please enter your starting location.",
    "请填写出发地点。",
    "出発地を入力してください。"
  ],
  "kyotoOnly": [
    "Please choose a starting point in Kyoto for this campus tool.",
    "这个校园工具请先选择京都范围内的起点。",
    "このツールでは京都市内の出発地を選んでください。"
  ],
  "groupSizeHint": [
    "An estimate, not a limit. More people can join later.",
    "只是预计人数，不是人数上限，之后可以继续加入。",
    "予定人数です。あとから何人でも参加できます。"
  ],
  "voteIntro": [
    "One shared question. Everyone gets a say.",
    "一个问题，一起决定。",
    "ひとつの質問を、みんなで決める。"
  ],
  "voteStep": [
    "MAKE A LITTLE DECISION",
    "把小决定交给大家",
    "小さな決めごとを一緒に"
  ],
  "voteKind": [
    "What are we deciding?",
    "这次决定什么？",
    "何を決める？"
  ],
  "foodPoll": [
    "Food & drink",
    "吃喝",
    "食べもの・飲みもの"
  ],
  "activityPoll": [
    "An activity",
    "玩什么",
    "やること"
  ],
  "timePoll": [
    "A time",
    "时间",
    "日時"
  ],
  "otherPoll": [
    "Anything else",
    "其他",
    "その他"
  ],
  "pollQuestionPlaceholder": [
    "e.g. Which game are we playing tonight?",
    "例如今晚玩哪个卡牌游戏？",
    "例：今夜は何のゲームをする？"
  ],
  "pollOptionPlaceholder": [
    "Option {number}",
    "选项 {number}",
    "選択肢 {number}"
  ],
  "addOption": [
    "Add an option",
    "添加选项",
    "選択肢を追加"
  ],
  "removeOption": [
    "Remove option",
    "删除选项",
    "選択肢を削除"
  ],
  "pollRules": [
    "One choice per person. You can change it. Share the room link to invite votes.",
    "每人一票，可以改选。分享房间链接邀请大家投票。",
    "1人1票・変更OK。ルームリンクでみんなを招待。"
  ],
  "yourChoice": [
    "Your choice",
    "你的选择",
    "あなたの選択"
  ],
  "votePercent": [
    "{percent}%",
    "{percent}%",
    "{percent}%"
  ],
  "voteLeading": [
    "Leading",
    "目前领先",
    "現在トップ"
  ],
  "chooseVote": [
    "Tap an option to vote",
    "点击一个选项投票",
    "選択肢をタップして投票"
  ],
  "voteTotal": [
    "{count} votes so far",
    "目前共 {count} 票",
    "現在{count}票"
  ],
  "pollEmptyTitle": [
    "A small question, a shared answer.",
    "小问题，一起决定。",
    "ちょっとした質問を、みんなで。"
  ],
  "editVote": [
    "Create another vote",
    "再发起一个投票",
    "もうひとつ投票を作る"
  ]
};
for (const [key, values] of Object.entries(refinements)) {
 en[key] = values[0]; zh[key] = values[1]; ja[key] = values[2];
}

en.privacyLink='Privacy'; zh.privacyLink='隐私'; ja.privacyLink='プライバシー';
en.termsLink='Terms'; zh.termsLink='使用说明'; ja.termsLink='利用について';


const consensusText = {
  "Indian food": [
    "Indian food",
    "印度菜",
    "インド料理"
  ],
  "Chinese food": [
    "Chinese food",
    "中餐",
    "中華料理"
  ],
  "Italian food": [
    "Italian food",
    "意大利菜",
    "イタリア料理"
  ],
  "McDonald’s": [
    "McDonald’s",
    "麦当劳",
    "マクドナルド"
  ],
  "planTab": [
    "Our decisions",
    "共同决定",
    "みんなで決める"
  ],
  "readyRoll": [
    "What do we agree on?",
    "大家想法怎么样？",
    "みんなの希望は？"
  ],
  "rollDescription": [
    "See the preferences, confirm one step at a time, and vote where needed.",
    "看看大家的偏好，逐项确认，有分歧再投票。",
    "希望を見て、ひとつずつ確認。迷ったら投票へ。"
  ],
  "roll": [
    "See our preferences",
    "整理大家的偏好",
    "みんなの希望を見る"
  ],
  "rulesPreview": [
    "Saved preferences, counted together",
    "汇总已保存的偏好",
    "保存された希望を集計"
  ],
  "plans": [
    "Our evening, step by step",
    "我们的聚会，一项项决定",
    "ひとつずつ、予定を決めよう"
  ],
  "consensusKicker": [
    "PREFERENCES → DECISIONS",
    "偏好 → 共同决定",
    "希望から、みんなの予定へ"
  ],
  "consensusIntro": [
    "A shared outline, not a generated itinerary. Confirm dinner, add activities, then find actual places.",
    "先整理想法，不生成固定行程。确认吃什么、玩什么，再找具体地点。",
    "自動の旅程ではなく、みんなの希望です。食事と遊びを決めてから、実際の場所を探しましょう。"
  ],
  "preferencesIn": [
    "{count} of {total} members saved preferences",
    "{total} 位成员中，{count} 位已保存偏好",
    "{total}人中{count}人が希望を保存"
  ],
  "budgetRange": [
    "Saved budgets: ¥{low}–¥{high} per person",
    "已填预算：每人 ¥{low}–¥{high}",
    "入力された予算：1人 ¥{low}〜¥{high}"
  ],
  "consensusCounting": [
    "Counts include everyone with saved preferences, even if attendance is still undecided. Multiple picks are allowed. Budgets are context, not verified prices.",
    "按已保存偏好的成员统计，包括尚未确定参加的人；每人可多选。预算仅供讨论，不代表实际价格。",
    "参加未定でも、希望を保存した全員を集計します。複数選択できます。予算は参考で、実際の料金ではありません。"
  ],
  "step_food": [
    "Dinner / food",
    "吃什么",
    "食事"
  ],
  "step_activity": [
    "Things to do",
    "玩什么",
    "何をする？"
  ],
  "step_after": [
    "Drinks / extras",
    "喝点什么、其他安排",
    "飲み物・追加の予定"
  ],
  "stepHint_food": [
    "Confirm one food choice. Other food ideas can go to a vote.",
    "先确认一个餐饮方向；有不同想法可以投票。",
    "食事の方針をひとつ確認。意見が分かれたら投票へ。"
  ],
  "stepHint_activity": [
    "One evening can include more than one activity. Confirm each separately.",
    "一个晚上可以做不止一件事，想做的可以分别确认。",
    "一晩に複数の活動もできます。それぞれ確認しましょう。"
  ],
  "stepHint_after": [
    "Optional additions. Confirm as many as the group wants.",
    "额外安排，可按需要分别确认。",
    "追加の予定です。必要に応じてそれぞれ確認できます。"
  ],
  "stillOpen": [
    "Still deciding",
    "还没决定",
    "相談中"
  ],
  "confirmChoice": [
    "Confirm",
    "确认这项",
    "これにする"
  ],
  "undoDecision": [
    "Undo confirmation",
    "取消确认",
    "確定を取り消す"
  ],
  "reconfirmDecision": [
    "Confirm again",
    "重新确认",
    "もう一度確認"
  ],
  "decisionBy": [
    "Confirmed by {name}",
    "由 {name} 确认",
    "{name}が確認"
  ],
  "categoryResponses": [
    "{count} of {total} preference savers chose something here",
    "已填偏好的 {total} 人中，{count} 人选了这类项目",
    "希望を保存した{total}人中{count}人がこの項目を選択"
  ],
  "peoplePicked": [
    "{count} of {total} picked this · who?",
    "{total} 人中 {count} 人想选 · 查看成员",
    "{total}人中{count}人が選択・メンバーを見る"
  ],
  "everyonePicked": [
    "Everyone picked this",
    "已填偏好的人都选了",
    "入力した全員が選択"
  ],
  "mostPicked": [
    "Most picked",
    "最多人选",
    "最多の希望"
  ],
  "noCategoryPicks": [
    "No preferences here yet. Add yours or start a vote.",
    "这类还没有偏好，可以补充或直接发起投票。",
    "まだ希望がありません。追加するか投票を作れます。"
  ],
  "voteThisStep": [
    "Vote on this step",
    "这一步投票决定",
    "この項目を投票"
  ],
  "newStepVote": [
    "Create a new vote",
    "重新发起投票",
    "新しい投票を作る"
  ],
  "seeStepVote": [
    "See votes",
    "查看投票",
    "投票を見る"
  ],
  "question_food": [
    "What should we eat?",
    "这次吃什么？",
    "何を食べる？"
  ],
  "question_activity": [
    "What should we do together?",
    "这次一起玩什么？",
    "みんなで何をする？"
  ],
  "question_after": [
    "Anything else for the evening?",
    "还有什么想安排的？",
    "ほかに何をしたい？"
  ],
  "pollSnapshot": [
    "Current votes only. Confirming is a group decision, not proof everyone agrees.",
    "这是当前票数，确认由成员操作，不代表全员已同意。",
    "現在の投票結果です。メンバーによる確認で、全員一致を意味しません。"
  ],
  "confirmResult": [
    "Confirm this result",
    "确认这个结果",
    "この結果で確定"
  ],
  "pollTie": [
    "Tied. Keep discussing or voting.",
    "目前平票，可以继续讨论或投票。",
    "同票です。相談や投票を続けましょう。"
  ],
  "pollWaiting": [
    "Waiting for votes",
    "等大家投票",
    "投票を待っています"
  ],
  "backConsensus": [
    "Back to our decisions",
    "返回共同决定",
    "みんなの予定へ"
  ],
  "nextRoute": [
    "Next: find places and save a route",
    "下一步：找地点，保存路线",
    "次は場所探しとルート"
  ],
  "routeAfterConsensus": [
    "Dinner and activities can share one evening. Choose real places in Maps, then enter their names or addresses in order.",
    "吃饭和活动可以放在同一个晚上。在地图选好具体地点后，按顺序填写名称或地址。",
    "食事も遊びも同じ夜に。地図で実際の場所を選び、名前か住所を順番に入力しましょう。"
  ],
  "confirmedChoices": [
    "Confirmed choices",
    "已经确认的安排",
    "確定した希望"
  ],
  "findActualPlaces": [
    "Search each choice in Maps, then enter the actual places below.",
    "点击去地图搜具体地点，再把选好的店名或地址填在下面。",
    "地図で場所を探し、決まった店名や住所を下に入力してください。"
  ],
  "decisionSaved": [
    "Choice confirmed for the room.",
    "已为房间确认这项安排。",
    "ルームの予定を確認しました。"
  ],
  "decisionRemoved": [
    "Confirmation removed.",
    "已取消这项确认。",
    "確定を取り消しました。"
  ],
  "decisionNeedsReview": [
    "Preferences or votes changed. Review the earlier confirmation before using it.",
    "偏好或票数发生变化，之前的确认需要重新查看。",
    "希望か投票が変わりました。以前の確定内容を見直してください。"
  ],
  "needsReview": [
    "Needs another look",
    "需要重新确认",
    "再確認が必要"
  ],
  "fromVote": [
    "An option added in the vote",
    "投票中添加的选项",
    "投票で追加した選択肢"
  ],
  "consensusChanged": [
    "Preferences or votes just changed. Review the latest counts and confirm again.",
    "偏好或票数刚有变化，请查看最新结果后重新确认。",
    "希望か投票が更新されました。最新の結果を確認してください。"
  ],
  "invalidDecision": [
    "Choose an option from this step.",
    "请选择这一步里的选项。",
    "この項目の選択肢を選んでください。"
  ],
  "pollUnsettled": [
    "This vote has no single leading option yet.",
    "投票还没有唯一领先的选项。",
    "まだ単独で最多の選択肢がありません。"
  ],
  "preferenceCategory": [
    "Preference category",
    "偏好分类",
    "希望の種類"
  ],
  "votePrefillHint": [
    "Prefilled from this step. Edit the options before sharing. A vote supports one choice per person.",
    "已带入这一步的偏好，可编辑选项；每人可选一项。",
    "この項目の希望を入力済みです。編集できます。投票は1人1票です。"
  ],
  "voteLimitHint": [
    "The 12 most-picked options are prefilled. Edit them to include the choices you need.",
    "已带入人数最多的 12 个选项，可编辑成需要讨论的选项。",
    "希望の多い12件を入力済みです。必要な選択肢に編集できます。"
  ],
  "saveFirst": [
    "Save your preferences before confirming a choice.",
    "请先保存偏好，再确认安排。",
    "予定を確認する前に希望を保存してください。"
  ]
};
for (const [key, values] of Object.entries(consensusText)) {
  en[key] = values[0]; zh[key] = values[1]; ja[key] = values[2];
}

export const dictionaries = { en, zh, ja };
export function translate(language, key, values = {}) {
  let text = dictionaries[language]?.[key] ?? en[key] ?? key;
  for (const [name, value] of Object.entries(values)) {
    text = text.replaceAll(`{${name}}`, String(value));
  }
  return text;
}
