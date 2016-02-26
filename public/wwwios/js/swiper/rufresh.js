var RefreshInit=function(obj){
	if(obj.hasClass("pullDown")){
		obj.append('<span class="pullDownIcon"></span><span class="pullDownLabel">Dropdown update</span>');
	}
	if(obj.hasClass("pullUp")){
		obj.append('<span class="pullUpIcon"></span><span class="pullUpLabel">Load more</span>');
	}
	//下拉刷新
	this.pullDown=function(){
		obj.addClass("flip");
		obj.find(".pullDownLabel").html("Let go and load data");
	}
	
	//上拉加载更多
	this.pullUp=function(){
		obj.addClass("flip");
		obj.find(".pullUpLabel").html("Let go and load data");
	}
	
	//加载数据
	this.loading=function(){
		obj.removeClass("flip");
		obj.addClass("loading");
        if(obj.hasClass("pullDown")){
            obj.find(".pullDownLabel").html("Loading...");
        }
        if(obj.hasClass("pullUp")){
            obj.find(".pullUpLabel").html("Loading..");
        }
	}

	//下拉还原
	this.pullDownReInit=function(){
		obj.removeClass("flip");
		obj.find(".pullDownLabel").html("Dropdown update");
	}
	
	//上拉还原
	this.pullUpReInit=function(){
		obj.removeClass("flip");
		obj.find(".pullUpLabel").html("Load more");
	 }
    //没有数据加载
    this.loadEnd=function(){
        obj.removeClass("loading");
        obj.find(".pullUpLabel").html("No More Data");
    }
	 //加载还原
	 this.loadReInit=function(){
	 	obj.removeClass("loading");
	 	obj.find(".pullUpLabel").html("Load more");
	 	obj.find(".pullDownLabel").html("Dropdown update");
	 }
	 //是否是等待松手状态
	 this.isFlip=function(){
	 	return obj.hasClass("flip");
	 }
	 //是否是上啦状态
	 
	 //是否是loading状态
	return this;
}