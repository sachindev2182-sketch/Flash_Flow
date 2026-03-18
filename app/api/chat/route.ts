import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import PromoCode from '@/models/PromoCode';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Wishlist from '@/models/Wishlist';
import Review from '@/models/Review';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';
import User from '@/models/User';

// Define types
type OrderStatus = 'pending' | 'confirmed' | 'processed' | 'shipped' | 'delivered' | 'cancelled';

interface CartItem {
  title: string;
  price: number;
  quantity: number;
  category?: string;
}

interface WishlistItem {
  title: string;
  price: number;
  category?: string;
  addedAt?: Date;
}

interface OrderItem {
  orderId: string;
  orderStatus: string;
  totalAmount: number;
  createdAt: Date;
}

interface ReviewItem {
  productId?: { title: string };
  rating: number;
  comment: string;
  createdAt: Date;
}

interface PromoCodeItem {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
}

interface ProductItem {
  _id: any;
  title: string;
  price: number;
  category: string;
  subcategory?: string;
  description?: string;
  isTrending?: boolean;
  createdAt?: Date;
  averageRating?: number;
  reviewCount?: number;
}

interface GenerateResponseParams {
  isGreeting: boolean;
  isHelpQuery: boolean;
  isCartQuery: boolean;
  isWishlistQuery: boolean;
  isOrderQuery: boolean;
  isReviewQuery: boolean;
  isPromoQuery: boolean;
  userId: string | null;
  cartInfo: {
    totalItems: number;
    subtotal: number;
    items: CartItem[];
  } | null;
  wishlistInfo: {
    totalItems: number;
    totalValue: number;
    items: WishlistItem[];
  } | null;
  recentOrders: OrderItem[];
  userReviews: ReviewItem[];
  products: ProductItem[];
  promoCodes: PromoCodeItem[];
  message: string;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { message, userId: passedUserId } = await req.json();
    console.log('[API] Message received:', message.substring(0, 100));

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get user from auth token
    const token = (await cookies()).get('authToken')?.value;
    let userId = passedUserId || null;
    let user = null;
    
    if (!userId && token) {
      try {
        const decoded = await adminAuth.verifySessionCookie(token, true);
        user = await User.findOne({ email: decoded.email });
        if (user) {
          userId = user._id.toString();
        }
      } catch (err) {
        console.log('Token auth failed');
      }
    }

    const lowerMessage = message.toLowerCase();
    
    // Define all query types
    const isGreeting = ['hi', 'hello', 'hey', 'hii', 'greetings', 'good morning', 'good afternoon', 'good evening'].some((k: string) => lowerMessage.includes(k));
    const isHelpQuery = ['help', 'what can you', 'how to', 'guide', 'what do you do', 'capabilities', 'features'].some((k: string) => lowerMessage.includes(k));
    
    const isCartQuery = ['cart', 'my cart', 'shopping cart', 'bag', 'my bag', 'items in cart', 'cart items', 'cart total', 'checkout'].some((k: string) => lowerMessage.includes(k));
    const isWishlistQuery = ['wishlist', 'my wishlist', 'favorites', 'saved items', 'save for later', 'favorite items', 'liked products'].some((k: string) => lowerMessage.includes(k));
    const isOrderQuery = ['order', 'orders', 'track', 'delivery', 'shipping', 'return', 'cancel', 'my order', 'order status', 'where is my order'].some((k: string) => lowerMessage.includes(k));
    const isReviewQuery = ['review', 'reviews', 'rating', 'ratings', 'feedback', 'testimonial', 'top rated', 'best rated'].some((k: string) => lowerMessage.includes(k));
    const isPromoQuery = ['promo', 'coupon', 'discount', 'offer', 'offers', 'deal', 'sale'].some((k: string) => lowerMessage.includes(k));

    // Fetch data based on query type
    let cartInfo: {
      totalItems: number;
      subtotal: number;
      items: CartItem[];
    } | null = null;
    
    let wishlistInfo: {
      totalItems: number;
      totalValue: number;
      items: WishlistItem[];
    } | null = null;
    
    let recentOrders: OrderItem[] = [];
    let userReviews: ReviewItem[] = [];
    let products: ProductItem[] = [];
    let promoCodes: PromoCodeItem[] = [];

    // Fetch cart data
    if (isCartQuery && userId) {
      const cart = await Cart.findOne({ userId }).lean();
      if (cart?.items?.length) {
        const cartItems = cart.items || [];
        const subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        
        cartInfo = {
          totalItems: cartItems.length,
          subtotal: subtotal,
          items: cartItems.slice(0, 5).map((item: any) => ({
            title: item.title,
            price: item.price,
            quantity: item.quantity,
          })),
        };
      }
    }

    // Fetch wishlist data
    if (isWishlistQuery && userId) {
      const wishlist = await Wishlist.findOne({ userId }).lean();
      if (wishlist?.items?.length) {
        const wishlistItems = wishlist.items || [];
        const totalValue = wishlistItems.reduce((sum: number, item: any) => sum + item.price, 0);
        
        wishlistInfo = {
          totalItems: wishlistItems.length,
          totalValue: totalValue,
          items: wishlistItems.slice(0, 5).map((item: any) => ({
            title: item.title,
            price: item.price,
          })),
        };
      }
    }

    // Fetch orders
    if (isOrderQuery && userId) {
      const orders = await Order.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
      
      recentOrders = orders.map((order: any) => ({
        orderId: order.orderId,
        orderStatus: order.orderStatus,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
      }));
    }

    // Fetch reviews
    if (isReviewQuery && userId) {
      const reviews = await Review.find({ userId })
        .sort({ createdAt: -1 })
        .populate('productId', 'title')
        .limit(5)
        .lean();
      
      userReviews = reviews.map((review: any) => ({
        productId: review.productId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      }));
    }

    // Fetch promo codes
    if (isPromoQuery) {
      promoCodes = await PromoCode.find({
        isActive: true,
        startDate: { $lte: new Date() },
        expiryDate: { $gt: new Date() },
      }).limit(5).lean();
    }

    // Search for products (if not a special query)
    if (!isGreeting && !isHelpQuery && !isCartQuery && !isWishlistQuery && !isOrderQuery && !isReviewQuery && !isPromoQuery) {
      // Extract search terms
      const searchTerms = lowerMessage.split(' ');
      
      // Price range detection
      const priceMatch = message.match(/(?:under|below|less than|budget of|max)\s*₹?\s*(\d+)/i);
      const priceRangeMatch = message.match(/(?:between|from)\s*₹?\s*(\d+)\s*(?:to|and)\s*₹?\s*(\d+)/i);

      // Category detection
      const categoryKeywords: Record<string, string[]> = {
        men: ['men', 'male', 'man', 'gentleman', 'boy'],
        women: ['women', 'woman', 'female', 'lady', 'girl'],
        kids: ['kids', 'child', 'children', 'baby', 'toddler', 'infant'],
        beauty: ['beauty', 'makeup', 'cosmetic', 'skincare', 'haircare', 'fragrance', 'perfume'],
        home: ['home', 'furniture', 'decor', 'kitchen', 'electronics', 'gadget', 'book']
      };

      // Subcategory keywords mapping (from chat-processor.ts)
      const subcategoryKeywords: Record<string, string[]> = {
        // Men subcategories
        'clothing': ['clothing', 'shirt', 't-shirt', 'jeans', 'pant', 'jacket', 'hoodie', 'sweater'],
        'footwear': ['shoe', 'footwear', 'sneaker', 'boot', 'sandal', 'loafer', 'slipper'],
        'sports': ['sports', 'gym', 'workout', 'training', 'athletic', 'sportswear'],
        'accessories': ['accessories', 'watch', 'belt', 'cap', 'hat', 'sunglass', 'wallet'],
        
        // Women subcategories
        'jewelery': ['jewelry', 'jewellery', 'necklace', 'earring', 'ring', 'bracelet'],
        
        // Kids subcategories
        'boys': ['boys', 'boy'],
        'girls': ['girls', 'girl'],
        'toys': ['toy', 'games', 'play', 'fun'],
        
        // Home subcategories
        'home decor': ['decor', 'decoration', 'vase', 'lamp', 'wall art'],
        'furnishing': ['furniture', 'sofa', 'chair', 'table', 'bed', 'mattress'],
        'kitchen': ['kitchen', 'cookware', 'utensil', 'appliance'],
        'groceries': ['grocery', 'food', 'snack', 'drink'],
        'electronics': ['electronic', 'laptop', 'phone', 'tv', 'camera', 'speaker'],
        'gadgets': ['gadget', 'smart', 'device'],
        'books': ['book', 'novel', 'reading'],
        
        // Beauty subcategories
        'makeup': ['makeup', 'lipstick', 'foundation', 'eyeshadow'],
        'skincare': ['skin', 'cream', 'lotion', 'moisturizer'],
        'haircare': ['hair', 'shampoo', 'conditioner'],
        'fragrance': ['fragrance', 'perfume', 'cologne']
      };

      // Build search query
      const query: any = {};
      
      // Price filters
      if (priceMatch) {
        query.price = { $lte: parseInt(priceMatch[1]) };
      }
      
      if (priceRangeMatch) {
        const minPrice = parseInt(priceRangeMatch[1]);
        const maxPrice = parseInt(priceRangeMatch[2]);
        query.price = { $gte: minPrice, $lte: maxPrice };
      }

      // Check for category mentions
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some((keyword: string) => lowerMessage.includes(keyword))) {
          query.category = category;
          break;
        }
      }

      // Check for subcategory mentions
      const matchedSubcategories: string[] = [];
      for (const [subcategory, keywords] of Object.entries(subcategoryKeywords)) {
        if (keywords.some((keyword: string) => lowerMessage.includes(keyword))) {
          matchedSubcategories.push(subcategory);
        }
      }

      // Build text search query
      const searchableTerms = searchTerms
        .filter((term: string) => term.length > 2)
        .filter((term: string) => !['show', 'find', 'get', 'me', 'looking', 'for', 'want', 'need', 'under', 'below', 'less', 'than', 'between', 'from', 'to', 'and', 'please', 'can', 'you', 'tell'].includes(term));

      // Create search conditions
      const searchConditions: any[] = [];

      // Add subcategory matches if found
      if (matchedSubcategories.length > 0) {
        searchConditions.push({ subcategory: { $in: matchedSubcategories } });
      }

      // Add text search if there are searchable terms
      if (searchableTerms.length > 0) {
        const textSearch = searchableTerms.join(' ');
        searchConditions.push({
          $or: [
            { title: { $regex: textSearch, $options: 'i' } },
            { description: { $regex: textSearch, $options: 'i' } },
            { subcategory: { $regex: textSearch, $options: 'i' } },
          ]
        });
      }

      // Combine search conditions with OR
      if (searchConditions.length > 0) {
        query.$or = searchConditions;
      }

      // Get products
      products = await Product.find(query)
        .sort({ isTrending: -1, isNewArrival: -1, createdAt: -1 })
        .limit(8)
        .lean();

      // If no products found, try a more lenient search
      if (products.length === 0) {
        const lenientQuery: any = {};
        
        // Keep price filters if they exist
        if (query.price) {
          lenientQuery.price = query.price;
        }
        
        // Try to find any products in the same category or with similar keywords
        if (query.category) {
          lenientQuery.category = query.category;
        }
        
        // Try to find products by any searchable term
        if (searchableTerms.length > 0) {
          const textSearch = searchableTerms.join(' ');
          lenientQuery.$or = [
            { title: { $regex: textSearch, $options: 'i' } },
            { description: { $regex: textSearch, $options: 'i' } },
            { category: { $regex: textSearch, $options: 'i' } },
          ];
        }
        
        products = await Product.find(lenientQuery)
          .sort({ isTrending: -1, createdAt: -1 })
          .limit(5)
          .lean();
      }

      // Get review stats for products
      if (products.length > 0) {
        const productIds = products.map(p => p._id);
        const reviewStats = await Review.aggregate([
          { $match: { productId: { $in: productIds } } },
          {
            $group: {
              _id: '$productId',
              averageRating: { $avg: '$rating' },
              reviewCount: { $sum: 1 }
            }
          }
        ]);

        // Create a map of review stats
        const reviewMap = new Map();
        reviewStats.forEach((stat: any) => {
          reviewMap.set(stat._id.toString(), {
            rating: stat.averageRating.toFixed(1),
            count: stat.reviewCount
          });
        });

        // Add review stats to products
        products = products.map((p: any) => ({
          ...p,
          averageRating: reviewMap.get(p._id.toString())?.rating,
          reviewCount: reviewMap.get(p._id.toString())?.count
        }));
      }
    }

    // Generate response based on query type
    const response = generateResponse({
      isGreeting,
      isHelpQuery,
      isCartQuery,
      isWishlistQuery,
      isOrderQuery,
      isReviewQuery,
      isPromoQuery,
      userId,
      cartInfo,
      wishlistInfo,
      recentOrders,
      userReviews,
      products,
      promoCodes,
      message
    });

    return NextResponse.json({
      response,
      isAuthenticated: !!userId,
      data: {
        ...(cartInfo && { cart: cartInfo }),
        ...(wishlistInfo && { wishlist: wishlistInfo }),
        ...(products.length && { products }),
        ...(recentOrders.length && { orders: recentOrders }),
        ...(userReviews.length && { reviews: userReviews }),
        ...(promoCodes.length && { promoCodes })
      }
    });

  } catch (error) {
    console.error(' [API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateResponse(params: GenerateResponseParams): string {
  const { 
    isGreeting, isHelpQuery, isCartQuery, isWishlistQuery, isOrderQuery, 
    isReviewQuery, isPromoQuery, userId, cartInfo, wishlistInfo, 
    recentOrders, userReviews, products, promoCodes, message 
  } = params;

  // Greeting
  if (isGreeting) {
    return `👋 Hello! I'm your Flash Flow shopping assistant. I can help you with:
• 🔍 Finding products (e.g., "show me shoes under ₹2000", "find men's shirts")
• 🛒 Your shopping cart (e.g., "what's in my cart?")
• ❤️ Your wishlist (e.g., "show my wishlist")
• 📦 Orders (e.g., "track my order")
• ⭐ Reviews (e.g., "show reviews")
• 🏷️ Promo codes (e.g., "any offers?")

How can I help you today?`;
  }

  // Help
  if (isHelpQuery) {
    return `🤖 **I can help you with:**

**Products** 
• Find items by name, category, or price
• Search by subcategory (shirts, shoes, electronics, etc.)

**Your Account**
• View your cart 🛒
• Check your wishlist ❤️
• Track orders 📦

**Information**
• Read reviews ⭐
• Find promo codes 🏷️
`;
  }

  // Cart query
  if (isCartQuery) {
    if (!userId) {
      return `🛒 **Cart Information**

Please log in to your account to view your cart.

You can log in by clicking the profile icon in the top right corner.

After logging in, you'll be able to:
• View items in your cart
• Check total price
• Proceed to checkout
• Apply promo codes`;
    }

    if (!cartInfo || cartInfo.totalItems === 0) {
      return `🛒 **Your Cart is Empty**

You haven't added any items to your cart yet.

Here's what you can do:
• Browse our categories: Men, Women, Kids, Beauty
• Check out trending products
• Add items you like to cart

Would you like me to show you some popular products?`;
    }

    const itemList = cartInfo.items.map((item: CartItem) => 
      `• **${item.title}** - ₹${item.price} x ${item.quantity} = ₹${item.price * item.quantity}`
    ).join('\n');

    return `🛒 **Your Shopping Cart**

${itemList}

${cartInfo.totalItems > 5 ? `\n*... and ${cartInfo.totalItems - 5} more items*\n` : ''}

**Cart Summary:**
• Total Items: ${cartInfo.totalItems}
• Subtotal: ₹${cartInfo.subtotal}

💰 Free shipping on orders above ₹5,000!`;
  }

  // Wishlist query
  if (isWishlistQuery) {
    if (!userId) {
      return `❤️ **Wishlist Information**

Please log in to your account to view your wishlist.

After logging in, you can:
• Save items you like
• Move items to cart
• Get price drop alerts`;
    }

    if (!wishlistInfo || wishlistInfo.totalItems === 0) {
      return `❤️ **Your Wishlist is Empty**

You haven't added any items to your wishlist yet.

Browse our products and click the heart icon ❤️ to save your favorites!

Would you like me to show you some popular products?`;
    }

    const itemList = wishlistInfo.items.map((item: WishlistItem) => 
      `• **${item.title}** - ₹${item.price}`
    ).join('\n');

    return `❤️ **Your Wishlist**

${itemList}

${wishlistInfo.totalItems > 5 ? `\n*... and ${wishlistInfo.totalItems - 5} more items*\n` : ''}

**Summary:**
• Total Items: ${wishlistInfo.totalItems}
• Total Value: ₹${wishlistInfo.totalValue}

Ready to buy? You can move items to your cart!`;
  }

  // Order query
  if (isOrderQuery) {
    if (!userId) {
      return `📦 **Order Information**

Please log in to your account to view your orders.

After logging in, you can:
• Track your orders
• Check delivery status
• View order history
• Request returns`;
    }

    if (recentOrders.length === 0) {
      return `📦 **No Orders Yet**

You haven't placed any orders with us yet.

Start shopping to see your orders here! Would you like me to show you some products?`;
    }

    const orderList = recentOrders.map((order: OrderItem) => {
      const statusEmoji: Record<string, string> = {
        pending: '⏳',
        confirmed: '✅',
        processed: '🔄',
        shipped: '📦',
        delivered: '🎉',
        cancelled: '❌'
      };
      const emoji = statusEmoji[order.orderStatus] || '📋';
      
      return `${emoji} **Order #${order.orderId}**\n   Status: ${order.orderStatus}\n   Amount: ₹${order.totalAmount}\n   Date: ${new Date(order.createdAt).toLocaleDateString()}`;
    }).join('\n\n');

    return `📦 **Your Recent Orders**

${orderList}`;
  }

  // Review query
  if (isReviewQuery) {
    if (!userId) {
      return `⭐ **Review Information**

Please log in to your account to view your reviews.

After purchasing products, you can:
• Share your experience
• Rate products
• Help other customers`;
    }

    if (userReviews.length === 0) {
      return `📝 **No Reviews Yet**

You haven't written any reviews yet.

After receiving your orders, you can share your experience and help other customers!

Check your orders page to review purchased items.`;
    }

    const avgRating = (userReviews.reduce((sum: number, r: ReviewItem) => sum + r.rating, 0) / userReviews.length).toFixed(1);
    
    const reviewList = userReviews.map((r: ReviewItem) => 
      `• **${r.productId?.title || 'Product'}**: ${'⭐'.repeat(r.rating)} - "${r.comment.substring(0, 50)}${r.comment.length > 50 ? '...' : ''}"`
    ).join('\n');

    return `📝 **Your Reviews**

You've written ${userReviews.length} reviews with an average rating of ${avgRating} ⭐

${reviewList}`;
  }

  // Promo query
  if (isPromoQuery) {
    if (promoCodes.length === 0) {
      return `🏷️ **Active Offers**

There are no active promo codes at the moment.

But don't worry! We regularly add new offers. Check back soon or:
• Browse our sale section
• Sign up for newsletters
• Follow us on social media`;
    }

    const promoList = promoCodes.map((p: PromoCodeItem) => 
      `• **${p.code}**: ${p.discountType === 'percentage' ? p.discountValue + '%' : '₹' + p.discountValue} off\n  Min order: ₹${p.minOrderAmount}`
    ).join('\n\n');

    return `🎉 **Available Offers**

${promoList}

Copy the code and apply at checkout!`;
  }

  // Product search results
  if (products.length > 0) {
    const productList = products.map((p: ProductItem, i: number) => {
      const reviewText = p.averageRating ? ` ⭐ ${p.averageRating} (${p.reviewCount} reviews)` : '';
      return `${i+1}. **${p.title}** - ₹${p.price}${reviewText}\n   📁 ${p.category}${p.subcategory ? ` - ${p.subcategory}` : ''}`;
    }).join('\n\n');

    return `✨ **Products you might like**

${productList}

${products.length === 8 ? '\n*Showing top 8 results*' : ''}
`;
  }

  // Default response for no matches
  return `I couldn't find specific products matching "${message}".

Here's what you can try:
• 🔍 Use specific keywords (e.g., "shirts", "shoes", "laptops", "perfume")
• 💰 Specify a price range (e.g., "under ₹2000", "between ₹1000 and ₹5000")
• 📁 Browse by category (Men, Women, Kids, Beauty, Home)
• 🔎 Search by subcategory (e.g., "jeans", "sneakers", "skincare", "furniture")

Or ask me about:
• Your orders 📦
• Reviews ⭐
• Promo codes 🏷️

How can I help you?`;
}