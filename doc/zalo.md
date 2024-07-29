Interceptors:
- Chat content:

  Chat panel:
    name: "On"
    state: {
      messages: list of message of current chat view
    }
- Sidebar:
  name: "Vr" -> build memo uiController for "Bs", is ConvListController (service: "convlist-controller"). when has new message, state props has changed make component rerender (data in contacts/groups props changed). When rerender, "Za" will get new list
    name: "Bs" -> component display list of visible friends/groups. connect to stores use hook to update state. It use 
    memo to build list items for "Za" component from ConvListController.listVisible

      name: "Za"  -> component has items prop store user id for display in sidebar (friends)




=============================================
socket: at default-embed-web-start..... column: 1008897
- addEventListener(message, _onMessage)

  _onMessage -> _processEventBlob -> _onRawData -> _onData -> onData -> onOnlineData -> onQueuedData -> processAction -> .... -> _processChatMessages -> .. ->

    _addMessages at default-embed-web-start..... column: 6810425
      --> add message to storage
      --> onReceiveNewMessage: web-startup..... column: 263482  (Ha class)
        - convert db message to preview item
        - add to preview manager

        --> onReceiveNewMessages at web-startup..... column: 239292
          --> onPreviewChange of ConvListController (web-startup..... column: 122672 - uiController props of "Bs")
            --> update listVisible props --> will make Za component rerender

==============================================
"Bs" component
-> memorizedProps.uiController (ms object)
--> convDataManager._pa (Ha object): preview-manager
