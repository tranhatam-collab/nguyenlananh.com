(function(){
  var $ = function(s){ return document.querySelector(s); };
  var statusBox = $("#adminStatus");
  var ordersBody = $("#ordersBody");
  function setStatus(message, tone){
    statusBox.textContent = message;
    statusBox.classList.remove("hidden","is-success","is-warning","is-danger");
    if(tone==="success") statusBox.classList.add("is-success");
    if(tone==="warning") statusBox.classList.add("is-warning");
    if(tone==="danger") statusBox.classList.add("is-danger");
  }
  function adminHeaders(){
    var adminKey = String(($("#adminKey")||{}).value||"").trim();
    var adminUser = String(($("#adminUser")||{}).value||"ops-team").trim();
    return {"content-type":"application/json","x-admin-key":adminKey,"x-admin-user":adminUser};
  }
  async function loadOrders(){
    var status = $("#orderStatus").value;
    var query = new URLSearchParams({status:status, limit:"100"});
    setStatus("Đang tải orders...","warning");
    var response = await fetch("/api/admin/payments/vietqr/orders?"+query.toString(), {headers:adminHeaders()});
    var body = await response.json().catch(function(){ return {}; });
    if(!response.ok) throw new Error(body.message||body.code||"Không thể tải orders");
    return Array.isArray(body.orders) ? body.orders : [];
  }
  async function confirmOrder(internalOrderId){
    var response = await fetch("/api/admin/vietqr-confirm", {
      method:"POST", headers:adminHeaders(),
      body:JSON.stringify({
        internal_order_id: internalOrderId,
        provider_ref: "vietqr_manual_"+internalOrderId,
        confirmation_note: "Manual confirmation via admin/payments"
      })
    });
    var body = await response.json().catch(function(){ return {}; });
    if(!response.ok) throw new Error(body.message||body.code||"Xác nhận thất bại");
    return body;
  }
  function renderRows(orders){
    ordersBody.innerHTML = "";
    if(!orders.length){
      var row = document.createElement("tr");
      row.innerHTML = '<td colspan="6" style="padding:10px;">Không có order.</td>';
      ordersBody.appendChild(row);
      return;
    }
    function td(text){ var d=document.createElement("td"); d.style.padding="8px"; d.textContent=text; return d; }
    orders.forEach(function(order){
      var row = document.createElement("tr");
      var amount = Number(order.amount||0).toLocaleString("vi-VN")+" "+(order.currency||"VND");
      row.appendChild(td(order.internal_order_id));
      row.appendChild(td(order.email));
      row.appendChild(td(amount));
      row.appendChild(td(order.transfer_note||"-"));
      row.appendChild(td(order.status||"-"));
      var actionCell = td("");
      if(order.status!=="confirmed"){
        var button = document.createElement("button");
        button.type = "button"; button.className = "btn"; button.textContent = "Xác nhận";
        button.addEventListener("click", async function(){
          button.disabled = true;
          try{
            setStatus("Đang xác nhận "+order.internal_order_id+"...","warning");
            await confirmOrder(order.internal_order_id);
            setStatus("Đã xác nhận "+order.internal_order_id,"success");
            renderRows(await loadOrders());
          } catch(error){
            setStatus(error.message||"Xác nhận thất bại","danger");
          } finally { button.disabled = false; }
        });
        actionCell.appendChild(button);
      } else { actionCell.textContent = "Đã xác nhận"; }
      ordersBody.appendChild(row);
    });
  }
  $("#reloadOrders").addEventListener("click", async function(){
    try{
      var orders = await loadOrders();
      renderRows(orders);
      setStatus("Đã tải "+orders.length+" orders","success");
    } catch(error){ setStatus(error.message||"Không thể tải orders","danger"); }
  });
})();
