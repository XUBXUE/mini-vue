import { effect } from "../effect";
import { isRef, proxyRefs, ref, unRef } from "../ref"

describe('test ref', () => {
  it('happy path', () => {
    let refs = ref(2);
    expect(refs.value).toBe(2);
  });

  it('Ref data', () => {
    const refs = ref(1);
    let sum;
    let callCount = 0;
    effect(() => {
      callCount++;
      sum = refs.value;
    });
    expect(sum).toBe(1);
    expect(callCount).toBe(1);
    refs.value = 2;
    expect(sum).toBe(2);
    expect(callCount).toBe(2);
    refs.value = 2;
    expect(sum).toBe(2);
    expect(callCount).toBe(2);
  });

  it('reactive Ref data', () => {
    const obj = ref({
      num: 1
    });
    let sum;
    effect(() => {
      sum = obj.value.num;
    })
    expect(sum).toBe(1)
    obj.value.num = 2;
    expect(sum).toBe(2)
  });

  it('test isRef', () => {
    let a = 1;
    let b = ref(a);
    expect(isRef(a)).toBe(false);
    expect(isRef(b)).toBe(true);
  });

  it('test unRef', () => {
    let a = ref(1);
    let b = 2;
    expect(unRef(a)).toBe(1);
    expect(unRef(b)).toBe(2);
  });

  it('test proxyRefs', () => {
    let user = {
      age: ref(18),
      name: 'xbx'
    }
    let proxyUser = proxyRefs(user);
    
    expect(user.age.value).toBe(18);
    expect(proxyUser.age).toBe(18);

    proxyUser.age = 20;
    expect(user.age.value).toBe(20);
    expect(proxyUser.age).toBe(20);

    proxyUser.age = ref(21);
    expect(user.age.value).toBe(21);
    expect(proxyUser.age).toBe(21);
  })
});