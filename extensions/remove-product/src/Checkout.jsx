import {
  Banner,
  useApi,
  Text,
  useTranslate,
  reactExtension,
  useCartLines,
  useSettings,
  useTotalAmount,
  useApplyCartLinesChange,
  useDiscountCodes,
} from '@shopify/ui-extensions-react/checkout';
import { useEffect, useState } from 'react';

export default reactExtension(
  'purchase.checkout.block.render',
  () => <Extension />,
);

function Extension() {
  const translate = useTranslate();
  const { extension } = useApi();

  const totalAmount = useTotalAmount();
  const cart = useCartLines();
  const applyCartLinesChange = useApplyCartLinesChange();
  const discountCodes = useDiscountCodes();

  const { threadhold_amount, gift_product_id, banner_is, banner_title, banner_description, banner_status } = useSettings();

  const [showBanner, setshowBanner] = useState(false);
  useEffect(() => {
    if (discountCodes.length === 0 && showBanner === true) {
      setshowBanner(false);
    }
  }, [discountCodes.length, showBanner, totalAmount]);

  let settings_validation_amount = threadhold_amount;
  let settings_gift_product_id = gift_product_id;
  let gift_product_found = false;
  let giftProductMerchandiseId = '';
  
  // Check if the gift product is in the cart
  // let totalAmountOfAllItems = 0;
  cart.forEach(function (item) {
     var productIdArray = item.merchandise.product.id.split('/');
     var productId = productIdArray[productIdArray.length - 1];
    //  let lineItemTotalAmount = item.cost.totalAmount.amount;
    //  totalAmountOfAllItems += lineItemTotalAmount;
     if (parseInt(settings_gift_product_id) === parseInt(productId)) {
       gift_product_found = true;
       if(gift_product_found){
         giftProductMerchandiseId = item.id;
       }
     }
  });

  // If the gift product is found and total amount is less than the threshold
  if (discountCodes.length > 0 && giftProductMerchandiseId && gift_product_found && totalAmount?.amount < settings_validation_amount) {
    removeProductById(giftProductMerchandiseId)
  }

  async function removeProductById(variantId){
    const result = await applyCartLinesChange({
      type: 'removeCartLine',
      id: variantId,
      quantity:1
    });
    if (result.type === 'success') {
      setshowBanner(true);
    }
    if (result.type === 'error') {
      console.error(result.message);
      console.error(result.errors); 
    }
  }

  return (
    <>
      {banner_is && showBanner ? (
        <>
          <Banner title={banner_title || ''} status={banner_status || 'info'}>
            <Text>{banner_description || ''}</Text>
          </Banner>
          {/* Add more banners if needed */}
        </>
      ) : (
        ''
      )}
    </>
  );
}