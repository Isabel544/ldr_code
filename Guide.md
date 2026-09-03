Native              | HTML Equivalent
<View />            | <div>
<Text />            | <p>
<Image />           | <img>
<TextInput />       | <input>
<Pressable />       | <button>
<ScrollView />      |
<FlatList />        |


it's all JS code (even for CSS)

Different file types (tsx vs ts)
tsx involves JSX (javascript)

ts does not involve JSX, best for: exp:
- calculatePrice.ts
- api.ts
- database.ts


Folder:
App/: where live pages are
    index.tsx=> can think as main.c
    layout.tsx=> configures navigation between the screens
Components/: reusable UI pieces (exp: function MyButton() {
      return (
        <Pressable>
          <Text>Click me</Text>
        </Pressable>
      );
    })
