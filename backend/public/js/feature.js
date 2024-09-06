async function addProduct() {
    const image = document.getElementById("image").value ? document.getElementById("image").files.item(0).name : ''; // kiểm tra nếu cs thì lấy tên ảnh :  rỗng
    const category = document.getElementById("category").value
    const name = document.getElementById("name").value
    const price = document.getElementById("price").value

    if(image && category && name && price){
        try {
            await axios.post('http://localhost:3000/product',{
                image: image,
                category: category,
                name: name,
                price: price
            })
            bootstrap.Modal.getInstance(document.getElementById("staticBackdrop")).hide(); // bootstrap cung cấp / ẩn sau khi sd
            alert("Thêm sản phẩm thành công")
            clsForm()
        }catch(e){
            alert("Error", e.message) 
        }
    } else {
        alert("Vui lòng điền đầy đủ thông tin ")
    }
}


async function fetchProduct() {
    try {
        /* let data = await axios.get("http://localhost:3000/product")
        return data.data */
        return await axios.get(`http://localhost:3000/api/products`)
    }catch(e){
        console.log(e);
    }
}
const VND = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
});
function renderProduct() {
    fetchProduct().then(data=>{
        let i = 1;
        let product=``
        data.data.map(value =>{
            product += `
            <tr>
                <td scope="col">${i++}</td>
                <td scope="col">${value.id}</td>
                <td scope="col">${value.name}</td>
                <td scope="col"><img src="/startup2-1.0.0/img/${value.image}" alt="" width="80"/></td>
                <td scope="col">${value.category}</td>
                <td scope="col">${formatCurrency(value.price)}</td>
                <td>
                    <button onclick="editProduct('${value.id}')" data-bs-toggle="modal" data-bs-target="#staticBackdrop" type="button" class="btn btn-warning"><i class="fa-solid fa-pencil text-dark"></i> Edit</button>
                    <button onclick="deleteProduct('${value.id}')" type="button" class="btn btn-danger"><i class="fa-solid fa-trash-can text-dả"></i> Delete</button>
                </td>
            </tr>
            `
        })// in dữ liwwuj ra table
        document.getElementById("tbody").innerHTML = product
    })
}



async function editProduct(id) {
    document.getElementById("addProduct").classList.add('d-none') // ẩn button add
    document.getElementById("editProduct").classList.remove('d-none') // hiện button edut
    // lưu id vào localstorage
    localStorage.setItem("productID", id)
    try {
        let {data} = await axios.get(`http://localhost:3000/product/${id}`);
        //document.getElementById("image").value ? document.getElementById("image").files.item(0).name : ''; // kiểm tra nếu cs thì lấy tên ảnh :  rỗng
        document.getElementById("productName").innerText = data.name
        document.getElementById("category").value = data.category
        document.getElementById("name").value = data.name
        document.getElementById("price").value = data.price
        document.getElementById('showImage').innerHTML = `<img src="/startup2-1.0.0/img/${data.image}" alt ="" width="200"/>` // hiển thị ảnh
    }catch (e) {
        console.log(e);
    }
}
async function saveProduct() {
    const image = document.getElementById("image").value ? document.getElementById("image").files.item(0).name : ''; // kiểm tra nếu cs thì lấy tên ảnh :  rỗng
    const category = document.getElementById("category").value
    const name = document.getElementById("name").value
    const price = document.getElementById("price").value

    const id = localStorage.getItem("productID")
    //console.log(id);

    // nếu có image (sd put => update toàn bộ)
    if(image){
        if(category && name && price){
            await axios.put(`http://localhost:3000/product/${id}`, {
                image: image,
                category: category,
                name: name,
                price: price
            })
        }
        else {
            alert("Vui lòng điền đầy đủ thông tin ")
        }

    } else { // nếu ko có image (sd patch => update từng phần)
        if(category && name && price){
            await axios.patch(`http://localhost:3000/product/${id}`, {
                category: category,
                name: name,
                price: price
            })
        } else {
            alert("Vui lòng điền đầy đủ thông tin ")
        }
    } 
    bootstrap.Modal.getInstance(document.getElementById("staticBackdrop")).hide(); // bootstrap cung cấp
    alert("Cập nhật thành công ")
    document.getElementById("addProduct").classList.remove('d-none') //hiện  button add
    document.getElementById("editProduct").classList.add('d-none') // ẩn button edut
    clsForm()
}

async function deleteProduct(id) {
    if(confirm("Bạn có muốn xóa sản phẩm !?")){
        await axios.delete(`http://localhost:3000/product/${id}`)
    }
    renderProduct()
}

/* SHOW HOME PRODUCT */
showHomeProduct=()=> {
    fetchProduct().then(data=>{
        let homeProduct=`
        <div class="row home-Product" id="home-Product" > <!-- đã sửa -->
            <div class=" d-flex">
                <h3 class="my-3">Sản Phẩm</h3>
                <a href="?mod=page&act=category&id=3" class="btn btn-outline-dark my-3 ms-auto">Xem thêm</a>
            </div>
        `
        data.data.map(value =>{
            homeProduct += `
            <div class="col-md-3 mb-3" >
                <div class=" pb-3 container-img border ">
                    <div class="product-img ">
                        <a href="/detail/${value.id}" class="productDetail" onclick="showProductDetail(id)">
                        <div class="sale position-absolute">
                            <p class="sale-content border bg-main text-danger d-inline px-2 py-1 fw-bold">
                                    Hot
                            </p>
                        </div>
                            
                        <img class="img-fluid product-image" src="/images/${value.image}" alt="" ></a>
                        <div class="product-action text-center icons">
                            <!-- trạng thái sản phẩm -->
                            <a class="btn btn-outline-dark "><i class="fa fa-shopping-cart"></i> Thêm vào</a>
                            <a class="btn btn-outline-dark " href=""><i class="far fa-heart"></i></a>                                  
                        </div>
                    </div>
                    <div class="product-content">
                        <p class="text-capitalize box text-start product-title">${value.name}</p>
                        <div class="d-flex justify-content-around product-price">
                            <span class="color-main fs-6 fw-bold"> ${formatCurrency(value.price)} </span>
                            <span class="text-muted"> <del> 5.100.000 đ </del></span>
                        </div>
                    </div>
                </div>
            </div> 
            `
        })
        homeProduct += ` </div>`
        document.getElementById("home-Product").innerHTML = homeProduct
    })
}
// amount
function formatCurrency(amount) {
    const formatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    });
    return formatter.format(amount);
    }
    



/* --SHOP PRODUCT-- */
showShopProduct=()=>{
    fetchProduct().then(data=>{
        //console.log(data.data);
        let shopProduct=`<div class="row py-1 shop-product">`
        data.data.map(value =>{
            shopProduct +=`
            <div class="col-sm-6 col-md-6 col-lg-4 col-xl-4 ">
                <div class="product-single fix container-img border pb-3 my-3">
                    <div class="product-img ">
                    <a href="detail.html?id=${value.id}" class="productDetail" onclick="showProductDetail(id)">
                        <div class="sale position-absolute">
                            <p class="sale-content border bg-main text-danger d-inline px-2 py-1 fw-bold">
                                    Hot
                            </p>
                        </div>
                            
                        <img class="img-fluid product-image" src="/images/${value.image}" alt="" ></a>
                        <div class="product-action text-center icons">
                            <!-- trạng thái sản phẩm -->
                            <a class="btn btn-outline-dark " href=""><i class="fa fa-shopping-cart"  onclick="addToCart('${value.id})'"></i> Thêm vào </a>
                            <a class="btn btn-outline-dark " href=""><i class="far fa-heart"></i></a>                                  
                        </div>
                    </div>
                    <div class="product-content">
                        <p class="text-capitalize box text-start product-title">${value.name} </p>
                        <div class="d-flex justify-content-around product-price">
                            <span class="color-main fs-6 fw-bold">${formatCurrency(value.price)}</span>
                            
                        </div>
                    </div>
                </div>
            </div>
            `
        })
        shopProduct +=`</div>`
        document.querySelector('.shop-product').innerHTML = shopProduct
    })
}


// search for products
function searchProduct() {
    let valueSearch = document.getElementById("search").value;
    axios.get("http://localhost:3000/product")
      .then(data => {
        let searchProduct = data.data.filter(value =>{
            return value.name.toLowerCase().includes(valueSearch.toLowerCase())
        })
        //console.log(searchProduct);
        document.querySelector('.shop-product').innerHTML = ""
        fetchProduct().then(data=>{
            //console.log(data.data);
            let shopProduct=`<div class="row py-1 shop-product">`
            searchProduct.map(value =>{
                shopProduct +=`
                <div class="col-sm-6 col-md-6 col-lg-4 col-xl-4 ">
                    <div class="product-single fix container-img border pb-3 my-3">
                        <div class="product-img ">
                        <a href="detail.html?id=${value.id}" class="productDetail" onclick="showProductDetail(id)">
                            <div class="sale position-absolute">
                                <p class="sale-content border bg-main text-danger d-inline px-2 py-1 fw-bold">
                                        Hot
                                </p>
                            </div>
                                
                            <img class="img-fluid product-image" src="/images/${value.image}" alt="" ></a>
                            <div class="product-action text-center icons">
                                <!-- trạng thái sản phẩm -->
                                <a class="btn btn-outline-dark " href=""><i class="fa fa-shopping-cart"  onclick="addToCart('${value.id}')"></i> Thêm vào</a>
                                <a class="btn btn-outline-dark " href=""><i class="far fa-heart"></i></a>                                  
                            </div>
                        </div>
                        <div class="product-content">
                            <p class="text-capitalize box text-start product-title">${value.name} </p>
                            <div class="d-flex justify-content-around product-price">
                                <span class="color-main fs-6 fw-bold">${formatCurrency(value.price)}</span>
                                
                            </div>
                        </div>
                    </div>
                </div>
                `
            })
            shopProduct +=`</div>`
            document.querySelector('.shop-product').innerHTML = shopProduct
        })
      })
      .catch(error => {
        console.error(error);
      });
}

async function sortProduct() {
    try {
        let valueSelect = document.getElementById("filterPrice").value;
        let response = await fetchProduct();
        let data = response.data; // Dữ liệu sản phẩm
        //console.log(data);
        
        // Lọc sản phẩm theo giá
        if (valueSelect === "low") {
            data = data.filter(product => product.price < 2000000); // Lọc các sản phẩm có giá nhỏ hơn 1000000
        } else if (valueSelect === "medium") {
            data = data.filter(product => product.price >= 2000000 && product.price <= 5000000); // Lọc các sản phẩm có giá từ 1000000 đến 5000000
        } else if (valueSelect === "high") {
            data = data.filter(product => product.price >= 5000000 && product.price <= 10000000); // Lọc các sản phẩm có giá lớn hơn hoặc bằng 5000000
        } else if (valueSelect === "more-high") {
            data = data.filter(product => product.price >= 10000000); // Lọc các sản phẩm có giá lớn hơn hoặc bằng 5000000
        }
        
        //showShopProduct(data);
        //console.log(data); // In ra mảng sản phẩm đã được lọc và sắp xếp
        
        //showShopProduct(data); // Gọi hàm hiển thị sản phẩm đã được lọc và sắp xếp
        let shopProduct=`<div class="row py-1 shop-product">`
        data.forEach(value => {
            shopProduct +=`
                <div class="col-sm-6 col-md-6 col-lg-4 col-xl-4 ">
                    <div class="product-single fix container-img border pb-3 my-3">
                        <div class="product-img ">
                        <a href="detail.html?id=${value.id}" class="productDetail" onclick="showProductDetail(id)">
                            <div class="sale position-absolute">
                                <p class="sale-content border bg-main text-danger d-inline px-2 py-1 fw-bold">
                                        Hot
                                </p>
                            </div>
                                
                            <img class="img-fluid product-image" src="/images/${value.image}" alt="" ></a>
                            <div class="product-action text-center icons">
                                <!-- trạng thái sản phẩm -->
                                <a class="btn btn-outline-dark " href=""><i class="fa fa-shopping-cart" onclick="addToCart('${value.id}')"></i> Thêm vào</a>
                                <a class="btn btn-outline-dark " href=""><i class="far fa-heart"></i></a>                                  
                            </div>
                        </div>
                        <div class="product-content">
                            <p class="text-capitalize box text-start product-title">${value.name} </p>
                            <div class="d-flex justify-content-around product-price">
                                <span class="color-main fs-6 fw-bold">${formatCurrency(value.price)}</span>
                                
                            </div>
                        </div>
                    </div>
                </div>
                `
        })
        shopProduct +=`</div>`
        document.querySelector('.shop-product').innerHTML = shopProduct
    } catch (e) {
        console.log(e);
    }
}


// cart product
let products =[];
let productInCart = localStorage.getItem('cart-product') ? JSON.parse(localStorage.getItem('cart-product')) : []

async function addToCart(id) {
    try {
        let valueSelect = document.getElementById("filterPrice").value;
        let response = await fetchProduct();
        let data = response.data; // Dữ liệu sản phẩm
        console.log(data);
        
        
    } catch (e) {
        console.log(e);
    }
}
/* async function addToCart(id) {
    try {
        // Lấy thông tin sản phẩm từ API
        let { data } = await axios.get(`http://localhost:3000/product/${id}`);
        console.log(data);
        // Kiểm tra xem giỏ hàng đã tồn tại trong Local Storage chưa
        let cartItems = localStorage.getItem("cartItems");
        
        if (cartItems) {
            // Giỏ hàng đã tồn tại trong Local Storage, cập nhật thông tin sản phẩm
            cartItems = JSON.parse(cartItems);
            cartItems.push(data);
            localStorage.setItem("cartItems", JSON.stringify(cartItems));
        } else {
            // Giỏ hàng chưa tồn tại trong Local Storage, tạo mới giỏ hàng
            cartItems = [data];
            localStorage.setItem("cartItems", JSON.stringify(cartItems));
        }
        
        console.log("Sản phẩm đã được thêm vào giỏ hàng:", data);
    } catch (error) {
        console.log("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
    }
}  */  
